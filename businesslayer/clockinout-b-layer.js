const { CLOCKINOUT } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createClockInOut(clockInOut) {
        clockInOut.store_id = ObjectId(clockInOut.store_id);
        const timestamp = clockInOut.dateWithTime;
        const dateObj = new Date(timestamp);
        // Extract hours, minutes, and seconds
        const hours = dateObj.getUTCHours();
        const minutes = dateObj.getUTCMinutes();
        
        // Convert hours to 12-hour format
        let formattedHours = hours % 12;
        formattedHours = formattedHours ? formattedHours : 12; // Handle midnight (0 hours)

        // Determine AM/PM
        const period = hours >= 12 ? 'PM' : 'AM';

        // Format the time
        const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        const queryPayload = { store_id: clockInOut.store_id};
        let existingDocument = await getdb(CLOCKINOUT).findOne(queryPayload);

        if (!existingDocument) {
            existingDocument = {
                businessDate: clockInOut.businessDate,
                shiftRecords: [],
                created_at : new Date()
            };
        }

        // Check if shiftRecords already has an entry for the roleID
        const existingShiftRecordIndex = existingDocument.shiftRecords.findIndex(record => record.roleId === clockInOut.roleId && !record.clockOutStatus);

        if (existingShiftRecordIndex !== -1) {
            // Update existing shift record with punchOutTime
            const punchOutTime = formattedTime; // Update based on actual logic
            existingDocument.shiftRecords[existingShiftRecordIndex].punchOutTime = punchOutTime;
            existingDocument.shiftRecords[existingShiftRecordIndex].totalHours = calculatesShiftHours(existingDocument.shiftRecords[existingShiftRecordIndex].punchInTime, punchOutTime); // Example calculation for total hours
            existingDocument.shiftRecords[existingShiftRecordIndex].clockOutStatus = true; // Example update status
            existingDocument.shiftRecords[existingShiftRecordIndex].employeeId = clockInOut.employeeId;
            existingDocument.shiftRecords[existingShiftRecordIndex].roleName = clockInOut.roleName;
            existingDocument.shiftRecords[existingShiftRecordIndex].roleId = clockInOut.roleId;
            existingDocument.shiftRecords[existingShiftRecordIndex].deviceID = clockInOut.deviceID;
            existingDocument.shiftRecords[existingShiftRecordIndex].node = clockInOut.node;
            
        } else {
            // Create new shift record
            const newShiftRecord = {
                roleId: clockInOut.roleId,
                employeeId:clockInOut.employeeId,
                roleName: clockInOut.roleName,
                punchInTime: formattedTime, // Format as needed
                punchOutTime: "12:00 AM", // Update based on actual punch out time logic
                totalHours: "0:00", // Update with actual calculation
                clockOutStatus: false,
                eventID: "",
                deviceID: clockInOut.deviceID,
                node: clockInOut.node
            };
            existingDocument.shiftRecords.push(newShiftRecord);
        }
        existingDocument.updated_at = new Date();
        existingDocument.totalHours = calculateTotalHours(existingDocument.shiftRecords);
        return new Promise((resolve, reject) => {
            getdb(CLOCKINOUT).updateOne(queryPayload, { $set: existingDocument }, { upsert: true }, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: clockInOutResponse(clockInOut,existingDocument.shiftRecords) });
            })
        })
    },

    getAllClockInOuts(clockInData) {
        const clockInDataQuery = {
            store_id: ObjectId(clockInData.store_id),
            businessDate:clockInData.businessDate
        }
        return new Promise((resolve, reject) => {
            getdb(CLOCKINOUT).find(clockInDataQuery).toArray()
                .then((result) => {
                    const shiftRecords = result.map(results => results.shiftRecords).flat();
                    resolve({ success: true, result : loadClockedInData(shiftRecords) });
                })
                .catch((err) => {
                    console.error("Error fetching all clockInOut:", err);
                    reject(err);
                });
        });
    },

}

function clockInOutResponse(clockInOut,shiftRecords) {
    return {
        employeeID: clockInOut.employeeID,
        role: clockInOut.role,
        action: clockInOut.action,
        shiftRecords: shiftRecords,
        totalHours: calculateTotalHours(shiftRecords),
        businessDate: clockInOut.businessDate,
        message: clockInOut.action === "OUT" ? "Clocked Out Successfully" : "Clocked In Successfully",
    };
}

// Function to convert time string to milliseconds since midnight
function timeStringToMs(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return hours * 3600000 + minutes * 60000;
}

function calculatesShiftHours(punchInTime,punchOutTime) {
    const startTimeMs = timeStringToMs(punchInTime);
    const endTimeMs = timeStringToMs(punchOutTime);
    // Calculate the difference in milliseconds
    let durationMs = endTimeMs - startTimeMs;
    
    // Convert milliseconds difference to hours and minutes
    const hours = Math.floor(durationMs / 3600000);
    durationMs %= 3600000;
    const minutes = Math.round(durationMs / 60000);
    
    // Format the total hours
    const totalHours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return totalHours
}

function calculateTotalHours(shiftRecords) {
    let totalHours = 0;
    let totalMinutes = 0;

    shiftRecords.forEach(record => {
        const [hoursStr, minutesStr] = record.totalHours.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        totalHours += hours;
        totalMinutes += minutes;
    });

    // Handle carryover from minutes to hours
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes %= 60;

    // Format the result to HH:MM
    const formattedHours = ('0' + totalHours).slice(-2);
    const formattedMinutes = ('0' + totalMinutes).slice(-2);

    return `${formattedHours}:${formattedMinutes}`;
}

function loadClockedInData(records) {
    const resultMap = {};
    records.forEach(record => {
        if(!record.clockOutStatus){
            resultMap[record.employeeId] = record.roleId;
        }
    });
    return resultMap;
}