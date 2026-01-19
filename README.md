# 🌸 Blooms - Professional Blogging Platform Backend

> A robust, scalable, and cloud-connected RESTful API built with **Spring Boot** and **MongoDB Atlas**. Designed with industry-standard **3-Layer Architecture**.

![Java](https://img.shields.io/badge/Java-17%2B-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-leaf)
![Status](https://img.shields.io/badge/Status-Active_Development-blue)

---

## 📖 About The Project

**Blooms** is a backend system for a modern blogging application. Unlike basic CRUD apps, Blooms focuses on **Scalability** and **Clean Architecture**. It handles complex relationships between Users, Blogs, Categories, and SubCategories using the flexibility of a NoSQL database.

### 🚀 Key Features
* **User Management:** Secure Registration and Login flows with duplicate validation.
* **Smart Categorization:** Hierarchical data handling (Categories & SubCategories).
* **Blog Engine:** Advanced blog creation with nested category mappings and automatic timestamping.
* **Cloud Native:** Fully integrated with **MongoDB Atlas** for real-time cloud data storage.
* **Scalable Architecture:** Refactored from Monolithic to **Service-Layer Pattern**.

---

## 🏗️ Architecture & Logic (The "Why" & "How")

We moved beyond simple coding to **Engineering**. The project follows the **Controller-Service-Repository** pattern to ensure Separation of Concerns.

### The 3-Layer Flow
Imagine a Restaurant:

1.  **🤵 Controller (The Waiter):**
    * **Role:** Handles incoming HTTP Requests (orders).
    * **Logic:** Validates the request format and passes it to the Service. Does *not* cook the food (no business logic).
    * *Code:* `in.bablu.blooms.controller`

2.  **👨‍🍳 Service Layer (The Chef):**
    * **Role:** The Brain of the application.
    * **Logic:** Contains all **Business Logic** (e.g., Check if user exists, Set creation date, Filter SubCategories).
    * *Code:* `in.bablu.blooms.services`

3.  **📦 Repository Layer (The Storekeeper):**
    * **Role:** Data Access Object (DAO).
    * **Logic:** Talks directly to **MongoDB Atlas**. It fetches or saves data without worrying about the recipe.
    * *Code:* `in.bablu.blooms.repositories`

### 🔄 Data Flow Diagram
`Client (Postman/React)` ➡️ `Controller` ➡️ `Service` ➡️ `Repository` ➡️ `MongoDB Atlas`

---

## 🛠️ Tech Stack

* **Language:** Java (JDK 17+)
* **Framework:** Spring Boot (Web, Data MongoDB)
* **Database:** MongoDB Atlas (Cloud NoSQL)
* **Tools:** IntelliJ IDEA, Maven, Postman/Swagger
* **Version Control:** Git & GitHub

---

## 📂 Project Structure

```text
src/main/java/in/codingage/blooms
│
├── config/          # MongoDB & App Configurations
├── controller/      # REST Controllers (API Endpoints)
├── dto/             # Data Transfer Objects (Request/Response)
├── models/          # MongoDB Entities (Data Shape)
├── repositories/    # Interfaces for Database Interaction
├── services/        # Business Logic & Rules
└── BloomsApplication.java  # Entry Point


Built with ❤️ and Java by Bablu Kumar.