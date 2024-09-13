const { CHECKS } = require("../../helper/collection-name");
const getdb = require("../../database/db").getDb;
const { ObjectId } = require("mongodb");
const moment = require("moment");
const { hourLabels } = require("../../helper/constants");

module.exports = {
  async getSaleReport(requestDetails) {
    const { dateFilter, store_id } = requestDetails.query;
    const storeObjectId = ObjectId(store_id);
    const filter = dateQuery(dateFilter);

    try {
      const pipeline = createSalePipeline(storeObjectId, filter);
      const [result] = await getdb(CHECKS).aggregate(pipeline).toArray();
      const {
        hourlySales, tenderSales, salesReport, categorySales
      } = result;

      return {
        success: true,
        result: {
          salesReport: formatSalesReport(salesReport),
          hourlySales: formatHourlySales(hourlySales),
          saleByTender: formatSalesByTender(tenderSales),
          salesByCategories: formatSalesByCategories(categorySales),
        },
      };
    } catch (err) {
      console.error(`Error in getSaleReport: ${err.message}`);
      return { success: false, error: err.message };
    }
  },

  async getCategoryReport(requestDetails) {
    const { dateFilter, store_id } = requestDetails.query;
    const storeObjectId = ObjectId(store_id);
    const filter = dateQuery(dateFilter);

    try {
      const categoryPipeline = createCategoryPipeline(storeObjectId, filter);
      const categoryResults = await getdb(CHECKS).aggregate(categoryPipeline).toArray();

      return {
        success: true,
        result: {
          categorySales: formatCategorySales(categoryResults),
        },
      };
    } catch (err) {
      console.error(`Error in getCategoryReport: ${err.message}`);
      return { success: false, error: `Error generating report: ${err.message}` };
    }
  },
};

// Helper Functions
function createSalePipeline(storeObjectId, filter) {
  return [
    { $match: { store_id: storeObjectId, created_at: filter } },
    {
      $facet: {
        salesReport: [{ $group: groupFields() }],
        hourlySales: [
          { $addFields: { hour: { $hour: "$created_at" } } },
          { $group: { _id: "$hour", totalAmount: { $sum: "$paidAmount" } } },
          { $sort: { _id: 1 } },
        ],
        tenderSales: [
          { $unwind: "$payments" },
          { $group: { _id: "$payments.paymentType", totalAmount: { $sum: "$payments.authorizedAmount" } } },
          { $project: { _id: 0, name: "$_id", amount: "$totalAmount" } },
          { $sort: { name: 1 } },
        ],
        categorySales: [
          { $unwind: "$seats" },
          { $unwind: "$seats.orders" },
          { $group: { _id: "$seats.orders.category", totalAmount: { $sum: "$seats.orders.total" } } },
          { $project: { _id: 0, name: "$_id", amount: "$totalAmount" } },
          { $sort: { name: 1 } },
        ],
      },
    },
  ];
}

function createCategoryPipeline(storeObjectId, filter) {
  return [
    { $match: { store_id: storeObjectId, created_at: filter } },
    { $unwind: "$seats" },
    { $unwind: "$seats.orders" },
    { $group: { _id: "$seats.orders.category", totalAmount: { $sum: "$seats.orders.total" } } },
    { $project: { _id: 0, name: "$_id", amount: "$totalAmount" } },
    { $sort: { name: 1 } },
  ];
}

function formatSalesReport(salesReport) {
  return salesReport.length > 0
    ? salesReport[0]
    : { tax: 0, discount: 0, paid: 0, gross: 0, netSale: 0 };
}

function formatHourlySales(hourlySales) {
  const data = hourLabels.reduce((acc, label) => ({ ...acc, [label]: 0 }), {});
  hourlySales.forEach(({ _id, totalAmount }) => {
    const hourStr = hourLabels[_id] || `${_id}:00 - ${_id + 1}:00`;
    data[hourStr] = totalAmount;
  });

  return { data, label: hourLabels };
}

function formatSalesByTender(tenderSales) {
  const labels = tenderSales.map(({ name }) => name);
  const data = tenderSales.reduce((acc, { name, amount }) => {
    acc[name] = amount;
    return acc;
  }, {});

  return { labels, data };
}

function formatSalesByCategories(categorySales) {
  const labels = categorySales.map(({ name }) => name);
  const data = categorySales.reduce((acc, { name, amount }) => {
    acc[name] = amount;
    return acc;
  }, {});

  return { labels, data };
}

function formatCategorySales(categoryResults) {
  return categoryResults.reduce((acc, result) => {
    if (result.name) {
      acc[result.name] = { name: result.name, amount: result.amount };
    }
    return acc;
  }, {});
}

function groupFields() {
  return {
    _id: null,
    tax: { $sum: "$tax" },
    discount: { $sum: "$discount" },
    paid: { $sum: "$paidAmount" },
    gross: { $sum: "$total" },
    netSale: { $sum: "$subTotal" },
  };
}

function dateQuery(dateFilter) {
  const now = moment();
  let startDate, endDate;

  switch (dateFilter) {
    case "T": // Today
      startDate = now.startOf("day").toDate();
      endDate = now.endOf("day").toDate();
      break;
    case "Y": // Yesterday
      startDate = now.subtract(1, "day").startOf("day").toDate();
      endDate = now.subtract(1, "day").endOf("day").toDate();
      break;
    case "LSW": // Last Week
      startDate = now.subtract(1, "week").startOf("week").toDate();
      endDate = now.startOf("week").toDate();
      break;
    case "W": // This Week
      startDate = now.startOf("week").toDate();
      endDate = now.endOf("week").toDate();
      break;
    case "L7D": // Last Seven Days
      startDate = now.subtract(7, "days").startOf("day").toDate();
      endDate = now.startOf("day").toDate();
      break;
    default:
      throw new Error("Invalid date filter");
  }
  return { $gte: startDate, $lt: endDate };
}
