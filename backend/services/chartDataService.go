package services

import (
	"fmt"
	"math"
	"sort"
	"strings"
	"time"

	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"
)

// GetChartData ดึงข้อมูลและ aggregate ค่า pm25 ตามช่วงเวลาที่ระบุ
// หาก query parameter "province" ถูกส่งมา จะทำการ filter โดยใช้ชื่อจังหวัดที่ trim แล้วเปรียบเทียบแบบเท่ากัน
// แต่ถ้าไม่ส่ง จะดึงข้อมูลของทุกจังหวัดโดย extract จังหวัดจาก address (โดยใช้ split_part)
func GetChartData(rangeType string, province string) (models.ChartData, error) {
	var chartData models.ChartData
	startTimeMs, endTimeMs := getTimeRange(rangeType)
	provinceFilter := normalizeProvince(province)

	query, args := buildHourlyQuery(rangeType, provinceFilter, province, startTimeMs, endTimeMs)

	type resultRow struct {
		Address   string
		TimeLabel time.Time
		AvgPM25   float64
	}
	var results []resultRow

	if err := database.DB.Raw(query, args...).Scan(&results).Error; err != nil {
		return chartData, err
	}

	hourLabels := buildHourLabels()
	chartData.Labels = hourLabels

	type valueAgg struct {
		sum   float64
		count int
	}

	provinceAgg := make(map[string]map[int]*valueAgg)
	for _, row := range results {
		provinceName := deriveProvince(row.Address)
		if provinceName == "" {
			continue
		}
		bucket := row.TimeLabel.Local().Hour()

		if _, ok := provinceAgg[provinceName]; !ok {
			provinceAgg[provinceName] = make(map[int]*valueAgg)
		}
		agg := provinceAgg[provinceName][bucket]
		if agg == nil {
			agg = &valueAgg{}
			provinceAgg[provinceName][bucket] = agg
		}
		agg.sum += row.AvgPM25
		agg.count++
	}

	provinceValues := make(map[string]map[int]float64)
	for prov, buckets := range provinceAgg {
		provinceValues[prov] = make(map[int]float64)
		for key, agg := range buckets {
			if agg != nil && agg.count > 0 {
				provinceValues[prov][key] = roundToTwoDecimals(agg.sum / float64(agg.count))
			}
		}
	}

	if provinceFilter != "" {
		dataSlice, found := selectProvinceData(provinceValues, provinceFilter)
		if !found {
			dataSlice = make([]float64, len(hourLabels))
		}
		chartData.Datasets = []models.DatasetChart{
			{Label: province, Data: dataSlice},
		}
		return chartData, nil
	}

	var provinceNames []string
	for prov := range provinceValues {
		provinceNames = append(provinceNames, prov)
	}
	sort.Strings(provinceNames)

	var datasets []models.DatasetChart
	for _, prov := range provinceNames {
		dataSlice := buildHourlyData(provinceValues[prov])
		datasets = append(datasets, models.DatasetChart{Label: prov, Data: dataSlice})
	}
	if datasets == nil {
		datasets = []models.DatasetChart{}
	}
	chartData.Datasets = datasets

	return chartData, nil
}

func roundToTwoDecimals(value float64) float64 {
	return math.Round(value*100) / 100
}

func buildHourlyQuery(rangeType, normalizedProvince, rawProvince string, startMs, endMs int64) (string, []interface{}) {
	filters := buildAddressFilters(rawProvince, normalizedProvince)
	var args []interface{}
	args = append(args, startMs, endMs)

	filterClause := buildFilterClause(filters, &args)

	if rangeType == "Today" {
		return `
			WITH hourly_data AS (
				SELECT 
					address,
					date_trunc('hour', to_timestamp(timestamp/1000)) as time_label,
					pm25,
					ROW_NUMBER() OVER (
						PARTITION BY address, date_trunc('hour', to_timestamp(timestamp/1000))
						ORDER BY timestamp DESC
					) as rn
				FROM sensor_data
				WHERE timestamp BETWEEN ? AND ?` + filterClause + `
			)
			SELECT 
				address,
				time_label,
				pm25 as avg_pm25
			FROM hourly_data
			WHERE rn = 1
			ORDER BY address, time_label
		`, args
	}

	return `
		SELECT address,
		       date_trunc('hour', to_timestamp(timestamp/1000)) as time_label,
		       AVG(pm25) as avg_pm25
		FROM sensor_data
		WHERE timestamp BETWEEN ? AND ?` + filterClause + `
		GROUP BY address, time_label
		ORDER BY address, time_label
	`, args
}

func buildFilterClause(filters []string, args *[]interface{}) string {
	if len(filters) == 0 {
		return ""
	}
	var parts []string
	for _, f := range filters {
		parts = append(parts, "address ILIKE ?")
		*args = append(*args, f)
	}
	return " AND (" + strings.Join(parts, " OR ") + ")"
}

func buildHourLabels() []string {
	labels := make([]string, 24)
	for i := 0; i < 24; i++ {
		labels[i] = fmt.Sprintf("%02d:00", i)
	}
	return labels
}

func buildHourlyData(data map[int]float64) []float64 {
	slice := make([]float64, 24)
	for hour := 0; hour < 24; hour++ {
		if val, ok := data[hour]; ok {
			slice[hour] = roundToTwoDecimals(val)
		}
	}
	return slice
}

func getTimeRange(rangeType string) (int64, int64) {
	now := time.Now()
	end := now.UnixMilli()

	var start time.Time
	switch rangeType {
	case "Today":
		start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	case "24 Hour":
		start = now.Add(-24 * time.Hour)
	case "1 Week":
		start = now.AddDate(0, 0, -7)
	case "1 Month":
		start = now.AddDate(0, -1, 0)
	case "3 Month":
		start = now.AddDate(0, -3, 0)
	case "1 Year":
		start = now.AddDate(-1, 0, 0)
	default:
		start = now.Add(-24 * time.Hour)
	}

	return start.UnixMilli(), end
}

func normalizeProvince(province string) string {
	if province == "" {
		return ""
	}
	province = strings.TrimSpace(province)
	province = strings.Split(province, "(")[0]
	province = strings.Split(province, ",")[0]
	prefixes := []string{"จังหวัด", "จ."}
	for _, prefix := range prefixes {
		if strings.HasPrefix(province, prefix) {
			province = strings.TrimSpace(strings.TrimPrefix(province, prefix))
		}
	}
	suffixes := []string{"จังหวัด", "Province", "province"}
	for _, suffix := range suffixes {
		if strings.HasSuffix(province, suffix) {
			province = strings.TrimSpace(strings.TrimSuffix(province, suffix))
		}
	}
	province = strings.TrimSpace(province)
	return canonicalizeProvince(province)
}

func selectProvinceData(provinceMap map[string]map[int]float64, target string) ([]float64, bool) {
	if target == "" {
		return nil, false
	}

	normalizedTarget := strings.ToLower(normalizeProvince(target))
	normalizedTarget = strings.ReplaceAll(normalizedTarget, "\u00a0", " ")
	normalizedTarget = strings.TrimSpace(normalizedTarget)
	normalizedTargetNoSpace := strings.ReplaceAll(normalizedTarget, " ", "")

	for prov, dataMap := range provinceMap {
		normalizedProv := strings.ToLower(normalizeProvince(prov))
		normalizedProvNoSpace := strings.ReplaceAll(normalizedProv, " ", "")

		if normalizedProv == normalizedTarget ||
			normalizedProvNoSpace == normalizedTargetNoSpace ||
			strings.Contains(normalizedProv, normalizedTarget) ||
			strings.Contains(normalizedTarget, normalizedProv) ||
			strings.Contains(normalizedProvNoSpace, normalizedTargetNoSpace) ||
			strings.Contains(normalizedTargetNoSpace, normalizedProvNoSpace) {
			return buildHourlyData(dataMap), true
		}
	}

	return nil, false
}

func deriveProvince(address string) string {
	addr := strings.TrimSpace(address)
	if addr == "" {
		return ""
	}

	if strings.Contains(addr, "กรุงเทพมหานคร") {
		return "กรุงเทพมหานคร"
	}

	lowerAddr := strings.ToLower(addr)
	if strings.Contains(lowerAddr, "bangkok") {
		return "กรุงเทพมหานคร"
	}
	if strings.Contains(lowerAddr, "lao") || strings.Contains(lowerAddr, "ລາວ") {
		return "Laos"
	}

	if idx := strings.LastIndex(addr, "จ."); idx >= 0 {
		candidate := addr[idx+len("จ."):]
		if normalized := normalizeProvince(candidate); normalized != "" && !isGenericProvinceWord(normalized) {
			return normalized
		}
	}

	if idx := strings.LastIndex(addr, "จังหวัด"); idx >= 0 {
		candidate := addr[idx+len("จังหวัด"):]
		if normalized := normalizeProvince(candidate); normalized != "" && !isGenericProvinceWord(normalized) {
			return normalized
		}
	}

	segments := strings.FieldsFunc(addr, func(r rune) bool {
		switch r {
		case ',', ';', '|', '/', '\\':
			return true
		default:
			return false
		}
	})
	if len(segments) == 0 {
		segments = []string{addr}
	}

	for i := len(segments) - 1; i >= 0; i-- {
		segment := strings.TrimSpace(segments[i])
		if segment == "" {
			continue
		}
		if normalized := normalizeProvince(segment); normalized != "" && !isGenericProvinceWord(normalized) {
			return normalized
		}

		words := strings.Fields(segment)
		for j := len(words) - 1; j >= 0; j-- {
			if normalized := normalizeProvince(words[j]); normalized != "" && !isGenericProvinceWord(normalized) {
				return normalized
			}
		}
	}

	if normalized := normalizeProvince(addr); normalized != "" && !isGenericProvinceWord(normalized) {
		return normalized
	}

	return ""
}

func canonicalizeProvince(name string) string {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return ""
	}

	lower := strings.ToLower(trimmed)
	lowerNoSpace := strings.ReplaceAll(lower, " ", "")

	for _, entry := range provinceAliasData {
		canonicalLower := strings.ToLower(entry.canonical)
		canonicalNoSpace := strings.ReplaceAll(canonicalLower, " ", "")
		if lower == canonicalLower || lowerNoSpace == canonicalNoSpace {
			return entry.canonical
		}
		for _, alias := range entry.aliases {
			aliasLower := strings.ToLower(alias)
			aliasNoSpace := strings.ReplaceAll(aliasLower, " ", "")
			if lower == aliasLower || lowerNoSpace == aliasNoSpace {
				return entry.canonical
			}
		}
	}

	return trimmed
}

func isGenericProvinceWord(word string) bool {
	w := strings.TrimSpace(strings.ToLower(word))
	if w == "" {
		return true
	}

	switch w {
	case "thailand", "ประเทศไทย", "ประเทศ", "amphoe", "district", "province", "city", "tambon", "ตำบล", "อำเภอ", "เขต", "เมือง", "mueang", "muang", "unknown", "central", "region":
		return true
	default:
		return false
	}
}

func buildAddressFilters(rawProvince, normalizedProvince string) []string {
	candidates := make(map[string]string)
	addCandidate := func(s string) {
		trimmed := strings.TrimSpace(s)
		if trimmed == "" {
			return
		}
		key := strings.ToLower(trimmed)
		if _, exists := candidates[key]; !exists {
			candidates[key] = trimmed
		}
	}

	if rawProvince != "" {
		addCandidate(rawProvince)
	}
	if normalizedProvince != "" {
		addCandidate(normalizedProvince)
	}

	canonical := canonicalizeProvince(normalizedProvince)
	if canonical != "" {
		addCandidate(canonical)
		for _, alias := range getProvinceAliases(canonical) {
			addCandidate(alias)
		}
	}

	var filters []string
	for _, val := range candidates {
		filters = append(filters, "%"+val+"%")
	}
	sort.Strings(filters)
	return filters
}

func getProvinceAliases(canonical string) []string {
	if canonical == "" {
		return nil
	}
	for _, entry := range provinceAliasData {
		if strings.EqualFold(entry.canonical, canonical) {
			return entry.aliases
		}
	}
	return nil
}

var provinceAliasData = []struct {
	canonical string
	aliases   []string
}{
	{canonical: "กรุงเทพมหานคร", aliases: []string{"bangkok", "bangkok province", "bangkok metropolis", "bangkok metropolitan", "krung thep", "krungthep", "bkk"}},
	{canonical: "กระบี่", aliases: []string{"krabi"}},
	{canonical: "กาญจนบุรี", aliases: []string{"kanchanaburi"}},
	{canonical: "กาฬสินธุ์", aliases: []string{"kalasin"}},
	{canonical: "กำแพงเพชร", aliases: []string{"kamphaeng phet", "kamphaengphet"}},
	{canonical: "ขอนแก่น", aliases: []string{"khon kaen", "khonkaen"}},
	{canonical: "จันทบุรี", aliases: []string{"chanthaburi"}},
	{canonical: "ฉะเชิงเทรา", aliases: []string{"chachoengsao"}},
	{canonical: "ชลบุรี", aliases: []string{"chon buri", "chonburi"}},
	{canonical: "ชัยนาท", aliases: []string{"chai nat", "chainat"}},
	{canonical: "ชัยภูมิ", aliases: []string{"chaiyaphum"}},
	{canonical: "ชุมพร", aliases: []string{"chumphon"}},
	{canonical: "เชียงราย", aliases: []string{"chiang rai", "chiangrai"}},
	{canonical: "เชียงใหม่", aliases: []string{"chiang mai", "chiangmai"}},
	{canonical: "ตรัง", aliases: []string{"trang"}},
	{canonical: "ตราด", aliases: []string{"trat"}},
	{canonical: "ตาก", aliases: []string{"tak"}},
	{canonical: "นครนายก", aliases: []string{"nakhon nayok", "nakhonnayok"}},
	{canonical: "นครปฐม", aliases: []string{"nakhon pathom", "nakhonpathom"}},
	{canonical: "นครพนม", aliases: []string{"nakhon phanom", "nakhonphanom"}},
	{canonical: "นครราชสีมา", aliases: []string{"nakhon ratchasima", "nakhonratchasima", "korat"}},
	{canonical: "นครศรีธรรมราช", aliases: []string{"nakhon si thammarat", "nakhonsithammarat"}},
	{canonical: "นครสวรรค์", aliases: []string{"nakhon sawan", "nakhonsawan"}},
	{canonical: "นนทบุรี", aliases: []string{"nonthaburi"}},
	{canonical: "นราธิวาส", aliases: []string{"narathiwat"}},
	{canonical: "น่าน", aliases: []string{"nan"}},
	{canonical: "บึงกาฬ", aliases: []string{"bueng kan", "buengkan"}},
	{canonical: "บุรีรัมย์", aliases: []string{"buri ram", "buriram"}},
	{canonical: "ปทุมธานี", aliases: []string{"pathum thani", "pathumthani"}},
	{canonical: "ประจวบคีรีขันธ์", aliases: []string{"prachuap khiri khan", "prachuapkhirikhan"}},
	{canonical: "ปราจีนบุรี", aliases: []string{"prachin buri", "prachinburi"}},
	{canonical: "ปัตตานี", aliases: []string{"pattani"}},
	{canonical: "พระนครศรีอยุธยา", aliases: []string{"phra nakhon si ayutthaya", "phrana khonsiayutthaya", "ayutthaya", "phra nakhon si ayutaya"}},
	{canonical: "พะเยา", aliases: []string{"phayao"}},
	{canonical: "พังงา", aliases: []string{"phang nga", "phangnga"}},
	{canonical: "พัทลุง", aliases: []string{"phatthalung"}},
	{canonical: "พิจิตร", aliases: []string{"phichit"}},
	{canonical: "พิษณุโลก", aliases: []string{"phitsanulok"}},
	{canonical: "เพชรบุรี", aliases: []string{"phetchaburi"}},
	{canonical: "เพชรบูรณ์", aliases: []string{"phetchabun"}},
	{canonical: "แพร่", aliases: []string{"phrae"}},
	{canonical: "ภูเก็ต", aliases: []string{"phuket"}},
	{canonical: "มหาสารคาม", aliases: []string{"maha sarakham", "mahasarakham"}},
	{canonical: "มุกดาหาร", aliases: []string{"mukdahan"}},
	{canonical: "แม่ฮ่องสอน", aliases: []string{"mae hong son", "maehongson"}},
	{canonical: "ยะลา", aliases: []string{"yala"}},
	{canonical: "ยโสธร", aliases: []string{"yasothon"}},
	{canonical: "ร้อยเอ็ด", aliases: []string{"roi et", "roiet"}},
	{canonical: "ระนอง", aliases: []string{"ranong"}},
	{canonical: "ระยอง", aliases: []string{"rayong"}},
	{canonical: "ราชบุรี", aliases: []string{"ratchaburi"}},
	{canonical: "ลพบุรี", aliases: []string{"lop buri", "lopburi"}},
	{canonical: "ลำปาง", aliases: []string{"lampang"}},
	{canonical: "ลำพูน", aliases: []string{"lamphun"}},
	{canonical: "เลย", aliases: []string{"loei"}},
	{canonical: "ศรีสะเกษ", aliases: []string{"sisaket", "si sa ket", "si saket"}},
	{canonical: "สกลนคร", aliases: []string{"sakon nakhon", "sakonnakhon"}},
	{canonical: "สงขลา", aliases: []string{"songkhla"}},
	{canonical: "สตูล", aliases: []string{"satun"}},
	{canonical: "สมุทรปราการ", aliases: []string{"samut prakan", "samutprakan"}},
	{canonical: "สมุทรสงคราม", aliases: []string{"samut songkhram", "samutsongkhram"}},
	{canonical: "สมุทรสาคร", aliases: []string{"samut sakhon", "samutsakhon"}},
	{canonical: "สระบุรี", aliases: []string{"saraburi"}},
	{canonical: "สระแก้ว", aliases: []string{"sa kaeo", "sakaeo"}},
	{canonical: "สิงห์บุรี", aliases: []string{"sing buri", "singburi"}},
	{canonical: "สุโขทัย", aliases: []string{"sukhothai"}},
	{canonical: "สุพรรณบุรี", aliases: []string{"suphan buri", "suphanburi"}},
	{canonical: "สุราษฎร์ธานี", aliases: []string{"surat thani", "suratthani"}},
	{canonical: "สุรินทร์", aliases: []string{"surin"}},
	{canonical: "หนองคาย", aliases: []string{"nong khai", "nongkhai"}},
	{canonical: "หนองบัวลำภู", aliases: []string{"nong bua lam phu", "nongbualamphu"}},
	{canonical: "อ่างทอง", aliases: []string{"ang thong", "angthong"}},
	{canonical: "อำนาจเจริญ", aliases: []string{"amnat charoen", "amnacharoen", "amnat charern"}},
	{canonical: "อุดรธานี", aliases: []string{"udon thani", "udonthani"}},
	{canonical: "อุทัยธานี", aliases: []string{"uthai thani", "uthaithani"}},
	{canonical: "อุตรดิตถ์", aliases: []string{"uttaradit"}},
	{canonical: "อุบลราชธานี", aliases: []string{"ubon ratchathani", "ubonratchathani"}},
	{canonical: "Laos", aliases: []string{"laos", "lao", "lao pdr", "ລາວ"}},
}
