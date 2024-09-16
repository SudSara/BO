const { CLOCKINOUT } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {
    async createClockInOut(clockInOut) {
        try {
            clockInOut.store_id = ObjectId(clockInOut.store_id);
            const queryPayload = { store_id: clockInOut.store_id, businessDate: clockInOut.businessDate };

            let existingDocument = await getOrCreateDocument(queryPayload);

            let activeShiftRecordIndex = findActiveShiftRecordIndex(existingDocument.shiftRecords, clockInOut.employeeId);

            if (clockInOut.action === "IN") {
                if (activeShiftRecordIndex !== -1) {
                    return createResponse(false, "You are already clocked in and haven't clocked out yet.");
                }
                existingDocument.shiftRecords.push(clockInOut);
            } else if (clockInOut.action === "OUT") {
                if (activeShiftRecordIndex === -1) {
                    return createResponse(false, "No active clock-in found to clock out.");
                }

                let activeShiftRecord = existingDocument.shiftRecords[activeShiftRecordIndex];

                if (!activeShiftRecord.isClockIn) {
                    return createResponse(false, "You have already clocked out.");
                }
                updateShiftRecordForClockOut(activeShiftRecord, clockInOut.punchOutTime);
                existingDocument.shiftRecords[activeShiftRecordIndex] = {
                    ...activeShiftRecord,
                    isClockIn: false,
                    punchOutTime: clockInOut.punchOutTime
                };
            }

            existingDocument.updated_at = new Date();
            await updateDocument(queryPayload, existingDocument);

            return createResponse(true, clockInOutResponse(clockInOut));
        } catch (err) {
            console.error("Error in createClockInOut:", err);
            throw err;
        }
    },

    async getAllClockInOuts(clockInData) {
        try {
            const clockInDataQuery = {
                store_id: ObjectId(clockInData.store_id),
                businessDate: clockInData.businessDate
            };
            const result = await getdb(CLOCKINOUT).find(clockInDataQuery).toArray();
            const shiftRecords = result.map(res => res.shiftRecords).flat();
            return { success: true, result: shiftRecords };
        } catch (err) {
            console.error("Error fetching all clockInOuts:", err);
            throw err;
        }
    },

    async getEmployeeClockInOuts(clockInData) {
        try {
            const clockInDataQuery = {
                store_id: ObjectId(clockInData.store_id),
                businessDate: clockInData.businessDate
            };
            const result = await getdb(CLOCKINOUT).find(clockInDataQuery).toArray();
            const shiftRecordsFiltered = result[0]?.shiftRecords.filter(record => record.employeeId === clockInData.employeeId) || [];
            return { success: true, result: shiftRecordsFiltered };
        } catch (err) {
            console.error("Error fetching employee clockInOuts:", err);
            throw err;
        }
    }
};

function findActiveShiftRecordIndex(shiftRecords, employeeId) {
    return shiftRecords.findIndex(record => record.employeeId === employeeId && record.isClockIn);
}

function updateShiftRecordForClockOut(activeShiftRecord, formattedTime) {
    activeShiftRecord.punchOutTime = formattedTime;
    activeShiftRecord.totalHours = calculatesShiftHours(activeShiftRecord.punchInTime, formattedTime);
}

async function updateDocument(queryPayload, document) {
    await getdb(CLOCKINOUT).updateOne(queryPayload, { $set: document }, { upsert: true });
}

function createResponse(success, message) {
    return { success, message };
}

function clockInOutResponse(clockInOut) {
    return {
        employeeID: clockInOut.employeeId,
        action: clockInOut.action,
        businessDate: clockInOut.businessDate,
        message: clockInOut.action === "OUT" ? "Clocked out successfully." : "Clocked in successfully."
    };
}



async function getOrCreateDocument(queryPayload) {
    let document = await getdb(CLOCKINOUT).findOne(queryPayload);
    if (!document) {
        document = {
            businessDate: queryPayload.businessDate,
            shiftRecords: [],
            created_at: new Date()
        };
    }
    return document;
}

function findActiveShiftRecord(shiftRecords, employeeId) {
    return shiftRecords.find(record => record.employeeId === employeeId && record.isClockIn);
}

function updateShiftRecordForClockOut(activeShiftRecord, formattedTime) {
    activeShiftRecord.punchOutTime = formattedTime;
    activeShiftRecord.totalHours = calculatesShiftHours(activeShiftRecord.punchInTime, formattedTime);
    activeShiftRecord.clockOutStatus = true;
    activeShiftRecord.action = "OUT";
}

async function updateDocument(queryPayload, document) {
    await getdb(CLOCKINOUT).updateOne(queryPayload, { $set: document }, { upsert: true });
}

function createResponse(success, message) {
    return { success, message };
}

function clockInOutResponse(clockInOut) {
    return {
        employeeID: clockInOut.employeeId,
        action: clockInOut.action,
        businessDate: clockInOut.businessDate,
        message: clockInOut.action === "OUT" ? "Clocked out successfully." : "Clocked in successfully."
    };
}

function timeStringToMs(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return (hours * 3600000) + (minutes * 60000);
}

function calculatesShiftHours(punchInTime, punchOutTime) {
    const startTimeMs = timeStringToMs(punchInTime);
    const endTimeMs = timeStringToMs(punchOutTime);
    let durationMs = endTimeMs - startTimeMs;

    if (durationMs < 0) {
        durationMs += 24 * 3600000;
    }

    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.round((durationMs % 3600000) / 60000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}



