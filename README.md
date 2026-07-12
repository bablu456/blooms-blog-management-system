# 🌸 Blooms - AI-First Blogging Platform Backend

> Blooms is now an AI-first blogging backend with intelligent blog discovery, conversational content search, and OpenRouter-powered recommendation support.

![Java](https://img.shields.io/badge/Java-17%2B-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-leaf)
![AI](https://img.shields.io/badge/AI-OpenRouter-purple)
![Status](https://img.shields.io/badge/Status-Active_Development-blue)

---

## 📖 About The Project

**Blooms** is a backend system for a modern blog application, built with an AI-first mindset. It combines traditional blog management with a conversational assistant that uses retrieved MongoDB blog context to answer user questions.

### 🚀 Key Features
* **User Management:** Secure registration, login, and session handling with OTP and JWT.
* **AI-powered Blog Assistant:** RAG-style chat endpoint uses blog content as retrieval context to answer questions about authors, trending posts, and recent blogs.
* **OpenRouter Integration:** Sends chat prompts to OpenRouter with primary and fallback models for higher reliability.
* **Smart Categorization:** Hierarchical Categories and SubCategories for organized blog mapping.
* **Blog Engine:** Blog creation, search, likes, and author discovery with automatic timestamping.
* **Cloud Native:** Supports MongoDB Atlas and CORS-enabled frontend integration.

---

## 🤖 AI First Architecture

Blooms adds an AI layer on top of the standard service architecture to make content searchable through conversation.

### AI components
* **`ChatController`** exposes the chat endpoint at `/api/chat`.
* **`RagService`** retrieves relevant blog context from MongoDB based on user queries.
* **`AiService`** forwards the assembled prompt to OpenRouter and returns the assistant reply.
* **Frontend Chatbot** at `frontend/src/components/ChatbotWidget.jsx` provides a live chat UI powered by this backend.

### The 3-Layer Flow
Imagine a Restaurant:

1.  **🤵 Controller (The Waiter):**
    * Handles incoming HTTP requests and passes them to the service layer.
    * *Code:* `in.bablu.blooms.controller`

2.  **👨‍🍳 Service Layer (The Chef):**
    * Executes business logic, including blog retrieval, AI prompt assembly, and validation.
    * *Code:* `in.bablu.blooms.services`

3.  **📦 Repository Layer (The Storekeeper):**
    * Accesses MongoDB and returns blog, user, category, and comment data.
    * *Code:* `in.bablu.blooms.repositories`

### 🔄 Data Flow Diagram
`Client (React / Bot)` ➡️ `ChatController` ➡️ `RagService` ➡️ `BlogRepository` / `UserRepository` ➡️ `OpenRouter` ➡️ `Client`

---

## 🛠️ Tech Stack

* **Language:** Java (JDK 17+)
* **Framework:** Spring Boot (Web, Data MongoDB, WebFlux WebClient)
* **AI Backend:** OpenRouter-compatible chat completions
* **Database:** MongoDB Atlas (Cloud NoSQL)
* **Frontend:** React + Vite + Tailwind CSS
* **Tools:** Maven, IntelliJ IDEA, Postman
* **Version Control:** Git & GitHub

---

## 📂 Project Structure

```text
src/main/java/in/bablu/blooms
│
├── config/          # MongoDB, OpenRouter, and app configuration
├── controller/      # REST Controllers (API Endpoints)
├── dto/             # Data Transfer Objects for request/response payloads
├── models/          # MongoDB entity models
├── repositories/    # Spring Data repository interfaces
├── services/        # Business logic including AI, blog, auth flows
└── BloomsApplication.java  # Application entry point
```

Built with ❤️ and Java by Bablu Kumar.