package services

import (
	"sort"
	"time"

	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"
)

// GetChartData ดึงข้อมูลและ aggregate ค่า pm25 ตามช่วงเวลาที่ระบุ
// หาก query parameter "province" ถูกส่งมา จะทำการ filter โดยใช้ address ILIKE
// แต่ถ้าไม่ส่ง จะดึงข้อมูลของทุกจังหวัดโดย extract จังหวัดจาก address (โดยใช้ split_part)
func GetChartData(rangeType string, province string) (models.ChartData, error) {
	var chartData models.ChartData
	var baseQuery string

	// กำหนดช่วงเวลาและฟังก์ชัน date_trunc ที่จะใช้
	switch rangeType {
	case "Today":
		if province != "" {
			baseQuery = `
				WITH hourly_data AS (
					SELECT 
						split_part(address, 'จ.', 2) as province,
						date_trunc('hour', to_timestamp(timestamp/1000)) as time_label,
						pm25,
						ROW_NUMBER() OVER (
							PARTITION BY split_part(address, 'จ.', 2), 
							date_trunc('hour', to_timestamp(timestamp/1000))
							ORDER BY timestamp DESC
						) as rn
					FROM sensor_data
					WHERE to_timestamp(timestamp/1000) >= date_trunc('day', now())
					  AND address ILIKE ?
				)
				SELECT 
					province,
					time_label,
					pm25 as avg_pm25
				FROM hourly_data
				WHERE rn = 1
				ORDER BY time_label
			`
		} else {
			baseQuery = `
				WITH hourly_data AS (
					SELECT 
						split_part(address, 'จ.', 2) as province,
						date_trunc('hour', to_timestamp(timestamp/1000)) as time_label,
						pm25,
						ROW_NUMBER() OVER (
							PARTITION BY split_part(address, 'จ.', 2), 
							date_trunc('hour', to_timestamp(timestamp/1000))
							ORDER BY timestamp DESC
						) as rn
					FROM sensor_data
					WHERE to_timestamp(timestamp/1000) >= date_trunc('day', now())
				)
				SELECT 
					province,
					time_label,
					pm25 as avg_pm25
				FROM hourly_data
				WHERE rn = 1
				ORDER BY province, time_label
			`
		}
	case "24 Hour":
		baseQuery = `
			SELECT split_part(address, 'จ.', 2) as province,
			       date_trunc('hour', to_timestamp(timestamp/1000)) as time_label,
			       AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '24 hours' AND now()
		`
		if province != "" {
			baseQuery += ` AND address ILIKE ?`
		}
		baseQuery += ` GROUP BY province, time_label`
		if province != "" {
			baseQuery += ` ORDER BY time_label`
		} else {
			baseQuery += ` ORDER BY province, time_label`
		}
	case "1 Week":
		baseQuery = `
			SELECT split_part(address, 'จ.', 2) as province,
			       date_trunc('day', to_timestamp(timestamp/1000)) as time_label,
			       AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '7 days' AND now()
		`
		if province != "" {
			baseQuery += ` AND address ILIKE ?`
		}
		baseQuery += ` GROUP BY province, time_label`
		if province != "" {
			baseQuery += ` ORDER BY time_label`
		} else {
			baseQuery += ` ORDER BY province, time_label`
		}
	case "1 Month":
		baseQuery = `
			SELECT split_part(address, 'จ.', 2) as province,
			       date_trunc('week', to_timestamp(timestamp/1000)) as time_label,
			       AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '1 month' AND now()
		`
		if province != "" {
			baseQuery += ` AND address ILIKE ?`
		}
		baseQuery += ` GROUP BY province, time_label`
		if province != "" {
			baseQuery += ` ORDER BY time_label`
		} else {
			baseQuery += ` ORDER BY province, time_label`
		}
	case "3 Month":
		baseQuery = `
			SELECT split_part(address, 'จ.', 2) as province,
			       date_trunc('month', to_timestamp(timestamp/1000)) as time_label,
			       AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '3 months' AND now()
		`
		if province != "" {
			baseQuery += ` AND address ILIKE ?`
		}
		baseQuery += ` GROUP BY province, time_label`
		if province != "" {
			baseQuery += ` ORDER BY time_label`
		} else {
			baseQuery += ` ORDER BY province, time_label`
		}
	case "1 Year":
		baseQuery = `
			SELECT split_part(address, 'จ.', 2) as province,
			       date_trunc('month', to_timestamp(timestamp/1000)) as time_label,
			       AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '1 year' AND now()
		`
		if province != "" {
			baseQuery += ` AND address ILIKE ?`
		}
		baseQuery += ` GROUP BY province, time_label`
		if province != "" {
			baseQuery += ` ORDER BY time_label`
		} else {
			baseQuery += ` ORDER BY province, time_label`
		}
	default:
		baseQuery = `
			SELECT split_part(address, 'จ.', 2) as province,
			       date_trunc('hour', to_timestamp(timestamp/1000)) as time_label,
			       AVG(pm25) as avg_pm25
			FROM sensor_data
			WHERE to_timestamp(timestamp/1000) BETWEEN now() - interval '24 hours' AND now()
		`
		if province != "" {
			baseQuery += ` AND address ILIKE ?`
		}
		baseQuery += ` GROUP BY province, time_label`
		if province != "" {
			baseQuery += ` ORDER BY time_label`
		} else {
			baseQuery += ` ORDER BY province, time_label`
		}
	}

	// โครงสร้างผลลัพธ์จาก query
	type resultRow struct {
		Province  string
		TimeLabel time.Time
		AvgPM25   float64
	}
	var results []resultRow

	if province != "" {
		if err := database.DB.Raw(baseQuery, "%"+province+"%").Scan(&results).Error; err != nil {
			return chartData, err
		}
	} else {
		if err := database.DB.Raw(baseQuery).Scan(&results).Error; err != nil {
			return chartData, err
		}
	}

	// กรณีมีการส่ง province filter (เฉพาะจังหวัดเดียว)
	if province != "" {
		var labels []string
		var dataValues []float64
		for _, row := range results {
			labels = append(labels, formatLabel(rangeType, row.TimeLabel))
			dataValues = append(dataValues, row.AvgPM25)
		}
		chartData.Labels = labels
		chartData.Datasets = []models.DatasetChart{
			{Label: province, Data: dataValues},
		}
	} else {
		// กรณีดึงข้อมูลของทุกจังหวัด
		// สร้าง map เพื่อจัดกลุ่มข้อมูลแยกตามจังหวัด และ map สำหรับเก็บ union ของ time labels
		provinceMap := make(map[string]map[string]float64)
		timeMap := make(map[string]time.Time)

		for _, row := range results {
			lbl := formatLabel(rangeType, row.TimeLabel)
			if _, ok := provinceMap[row.Province]; !ok {
				provinceMap[row.Province] = make(map[string]float64)
			}
			provinceMap[row.Province][lbl] = row.AvgPM25
			if _, exists := timeMap[lbl]; !exists {
				timeMap[lbl] = row.TimeLabel
			}
		}

		// เรียงลำดับ union ของ time labels ตามลำดับเวลา
		var times []time.Time
		for _, t := range timeMap {
			times = append(times, t)
		}
		sort.Slice(times, func(i, j int) bool { return times[i].Before(times[j]) })

		var sortedLabels []string
		for _, t := range times {
			sortedLabels = append(sortedLabels, formatLabel(rangeType, t))
		}
		chartData.Labels = sortedLabels

		// สร้าง dataset สำหรับแต่ละจังหวัด โดยใช้ sortedLabels เป็นแกน X
		var datasets []models.DatasetChart
		for prov, dataMap := range provinceMap {
			var dataSlice []float64
			for _, lbl := range sortedLabels {
				if val, ok := dataMap[lbl]; ok {
					dataSlice = append(dataSlice, val)
				} else {
					dataSlice = append(dataSlice, 0)
				}
			}
			datasets = append(datasets, models.DatasetChart{Label: prov, Data: dataSlice})
		}
		chartData.Datasets = datasets
	}

	return chartData, nil
}

// Helper function สำหรับฟอร์แมต label ตามช่วงเวลา
func formatLabel(rangeType string, t time.Time) string {
	switch rangeType {
	case "Today", "24 Hour":
		return t.Format("15:04")
	case "1 Week":
		return t.Format("Mon")
	case "1 Month":
		return "Wk " + t.Format("02")
	case "3 Month", "1 Year":
		return t.Format("Jan")
	default:
		return t.Format("15:04")
	}
}
