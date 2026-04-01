import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dataFilter.js";
import XLSX from "xlsx";

export async function addExpense(req, res) {
  const userId = req.user._id; //request coming from mongodb id
  const { description, amount, category, date } = req.body;

  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const newExpense = new expenseModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });
    await newExpense.save(); //save newIncome in db
    //send response
    res.json({
      success: true,
      message: "Expense added successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

//to all expense
export async function getAllExpense(req, res) {
  const userId = req.user._id;
  try {
    const expense = await expenseModel.find({ userId }).sort({ date: -1 }); //find income for particular user, then sort using date(-1 = latest)
    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

//to update a particular expense
export async function updateExpense(req, res) {
  const { id } = req.params;
  const userId = req.user._id;
  const { description, amount } = req.body; //filled by user

  try {
    const updatedExpense = await expenseModel.findOneAndUpdate(
      { _id: id, userId }, //find using mongodb id containing id and userId
      { description, amount }, //if updatedIncome is found then update description and amount
      { new: true },
    );
    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }
    res.json({
      success: true,
      message: "Expense updated successfully.",
      data: updatedExpense,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

//delete an expense
export async function deleteExpense(req, res) {
  try {
    const expense = await expenseModel.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }
    //if found
    return res.json({
      success: true,
      message: "Expense deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

//download excel for expense
export async function downloadExpenseExcel(req, res) {
  const userId = req.user._id;
  try {
    const expense = await expenseModel.find({ userId }).sort({ date: -1 });
    const plainData = expense.map((exp) => ({
      Description: exp.description,
      Amount: exp.amount,
      Category: exp.category,
      Date: new Date(exp.date).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(plainData); //create worksheet containing plain data
    const workbook = XLSX.utils.book_new(); //create excelsheet
    XLSX.utils.book_append_sheet(workbook, worksheet, "expenseModel"); //sheet append to bbok
    XLSX.writeFile(workbook, "expense_details.xlsx"); //name of file when tested
    res.download("expense_details.xlsx");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

//to get overview of expense
export async function getExpenseOverview(req, res) {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query; //if range=monthly get req from query
    const { start, end } = getDateRange(range); //get start end date from range

    const expense = await expenseModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalExpense = expense.reduce(
      (acc, cur) => acc + Number(cur.amount),
      0,
    );
    const averageExpense =
      expense.length > 0 ? totalExpense / expense.length : 0;
    const numberOfTransactions = expense.length;

    const recentTransactions = expense.slice(0, 9);
    res.json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
