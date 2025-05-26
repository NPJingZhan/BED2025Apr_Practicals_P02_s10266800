const studentModel = require("../models/studentModel");

async function getAllStudents(req, res) {
  try {
    const students = await studentModel.getAllStudents();
    res.json(students);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).send("Error retrieving student details");
  }
}

async function getStudentById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).send("Invalid student ID");
  try {
    const student = await studentModel.getStudentById(id);
    if (!student) return res.status(404).send("Student not found");
    res.json(student);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).send("Error retrieving student details");
  }
}

async function createStudent(req, res) {
  const { name, address } = req.body;
  if (!name) return res.status(400).send("Name is required");
  try {
    const newStudent = await studentModel.createStudent({ name, address });
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).send("Error creating student");
  }
}

async function updateStudent(req, res) {
  const id = parseInt(req.params.id);
  const { name, address } = req.body;
  if (isNaN(id)) return res.status(400).send("Invalid student ID");
  if (!name) return res.status(400).send("Name required");
  try {
    const updated = await studentModel.updateStudent(id, { name, address });
    if (!updated) return res.status(404).send("Student not found");
    res.json(updated);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).send("Error updating student");
  }
}

async function deleteStudent(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).send("Invalid student ID");
  try {
    const deleted = await studentModel.deleteStudent(id);
    if (!deleted) return res.status(404).send("Student not found");
    res.json({ message: `Student with ID ${id} deleted successfully` });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).send("Error deleting student");
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};