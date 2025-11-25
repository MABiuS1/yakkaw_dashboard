// services/daily_ranking.go
package services

import (
	"database/sql"
	"fmt"
	"time"

	"yakkaw_dashboard/database"
)

type DailyRankRow struct {
	Key    string  `json:"key"` // address | place | province
	Avg    float64 `json:"avg"`
	Rank   int     `json:"rank"`
	Count  int     `json:"count"`
	Date   string  `json:"date"`
	Metric string  `json:"metric"`
	Group  string  `json:"group"`
}

// GetDailyRankingGrouped จัดอันดับเฉลี่ยรายวันโดย group: address | place | province
// dateStr: YYYY-MM-DD (ใช้ TZ Asia/Bangkok)
func GetDailyRankingGrouped(dateStr, metric, group string, limit int) ([]DailyRankRow, error) {
	metricCol, ok := map[string]string{
		"pm25":        "pm25",
		"pm10":        "pm10",
		"pm100":       "pm100",
		"aqi":         "aqi",
		"temp":        "temperature",
		"temperature": "temperature",
		"humidity":    "humidity",
	}[metric]
	if !ok {
		return nil, fmt.Errorf("invalid metric")
	}

	groupCol, ok := map[string]string{
		"address":  "address",
		"place":    "place",
		"province": "province",
	}[group]
	if !ok {
		return nil, fmt.Errorf("invalid group")
	}

	if groupCol == "province" {
		groupCol = "regexp_replace(trim(regexp_replace(address, '^\\s+|\\s+$', '', 'g')), '^.*\\s+', '')"
	}

	loc, _ := time.LoadLocation("Asia/Bangkok")
	t, err := time.ParseInLocation("2006-01-02", dateStr, loc)
	if err != nil {
		return nil, fmt.Errorf("invalid date (expect YYYY-MM-DD)")
	}
	start := t
	end := t.Add(24 * time.Hour)

	query := fmt.Sprintf(`
        WITH d AS (
            SELECT
                %s AS key,
                AVG(NULLIF(%s,0)) AS avg_val,
                COUNT(*)          AS cnt
            FROM sensor_data
            WHERE (to_timestamp(timestamp/1000) AT TIME ZONE 'Asia/Bangkok') >= ?
              AND (to_timestamp(timestamp/1000) AT TIME ZONE 'Asia/Bangkok') <  ?
              AND %s IS NOT NULL
              AND %s <> ''
            GROUP BY %s
        )
        SELECT key, avg_val, cnt,
               RANK() OVER (ORDER BY avg_val DESC) AS rk
        FROM d
        ORDER BY rk
        LIMIT ?;
    `, groupCol, metricCol, groupCol, groupCol, groupCol)

	rows, err := database.DB.Raw(query, start, end, limit).Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	res := make([]DailyRankRow, 0, limit)
	for rows.Next() {
		var key sql.NullString
		var avg sql.NullFloat64
		var cnt int
		var rk int
		if err := rows.Scan(&key, &avg, &cnt, &rk); err != nil {
			return nil, err
		}
		row := DailyRankRow{
			Key:    "",
			Avg:    0,
			Rank:   rk,
			Count:  cnt,
			Date:   dateStr,
			Metric: metric,
			Group:  group,
		}
		if key.Valid {
			row.Key = key.String
		}
		if avg.Valid {
			row.Avg = avg.Float64
		}
		res = append(res, row)
	}
	return res, nil
}
