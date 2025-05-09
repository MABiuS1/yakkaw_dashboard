package services

import (
	"time"
	"yakkaw_dashboard/database"
	"yakkaw_dashboard/models"

	"gorm.io/gorm"
)

func CreateDevice(device models.Device) (models.Device, error) {
	// ตั้งค่า deploy_date เป็นเวลาปัจจุบันถ้าไม่มีการตั้งค่า
	if device.DeployDate.IsZero() {
		device.DeployDate = time.Now()
	}

	// สร้าง device ในฐานข้อมูล
	if err := database.DB.Create(&device).Error; err != nil {
		return models.Device{}, err
	}
	return device, nil
}

func GetDeviceByDVID(dvid string) (models.Device, error) {
	var device models.Device
	if err := database.DB.Where("dvid = ?", dvid).First(&device).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return device, nil // Return nil if not found
		}
		return device, err
	}
	return device, nil
}

func GetAllDevices() ([]models.Device, error) {
	var devices []models.Device
	if err := database.DB.Find(&devices).Error; err != nil {
		return nil, err
	}
	return devices, nil
}

func UpdateDevice(dvid string, device models.Device) (models.Device, error) {
	var existingDevice models.Device
	// ค้นหาข้อมูล device ที่มี DVID ตรงกัน
	if err := database.DB.Where("dvid = ?", dvid).First(&existingDevice).Error; err != nil {
		return models.Device{}, err
	}

	// อัปเดตข้อมูลที่สามารถแก้ไขได้
	existingDevice.Model = device.Model
	existingDevice.Address = device.Address
	existingDevice.Longitude = device.Longitude
	existingDevice.Latitude = device.Latitude
	// ตั้งค่า deploy_date เป็นเวลาปัจจุบันถ้าไม่มีการส่งมา
	if device.DeployDate.IsZero() {
		existingDevice.DeployDate = time.Now()
	} else {
		existingDevice.DeployDate = device.DeployDate
	}

	// บันทึกการอัปเดตข้อมูล
	if err := database.DB.Save(&existingDevice).Error; err != nil {
		return models.Device{}, err
	}

	return existingDevice, nil
}

func DeleteDevice(id uint) error {
	if err := database.DB.Delete(&models.Device{}, id).Error; err != nil {
		return err
	}
	return nil
}
