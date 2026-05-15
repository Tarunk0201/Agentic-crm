# IVR Integration Guide for Frontend Developers

This document explains the endpoints and payload structures required to integrate the IVR calling features into the frontend application. It covers triggering single calls and the three different campaign modes: Immediate, Scheduled, and Multi-Level Batched.

---

## Base Requirements
- All requests require the user's authentication token (typically a JWT in the `Authorization: Bearer <token>` header) because these routes use the `protectTenant` middleware.
- `leads` should always be an array of objects containing at least `name` and `phone`.

---

## 1. Trigger Single AI Call

Use this endpoint when a user clicks "Call Now" on a single contact's profile.

**Endpoint:** `POST /api/ivr-agent/trigger_ai_call`

**When to use:** For one-off, immediate calls to a single lead.

**Payload:**
```json
{
  "action_name": "Support Follow Up - John Doe", 
  "name": "John Doe",
  "phone": "+919876543210"
}
```

**Parameters Explained:**
- `action_name` *(String)*: A descriptive name for the UI history/logs.
- `name` *(String)*: Customer's name.
- `phone` *(String)*: Customer's phone number with country code.

---

## 2. Trigger Campaign Calls

Use this endpoint when a user selects multiple contacts and wants to trigger a bulk calling campaign. The behavior changes entirely based on the `trigger_type` parameter.

**Endpoint:** `POST /api/ivr-agent/trigger_campaign`

### Flow A: Immediate Campaign
**When to use:** The user wants to call a selected list of people right now without any delay.

**Payload:**
```json
{
  "action_name": "Summer Discount Blast",
  "trigger_type": "immediate",
  "leads": [
    { "name": "Alice", "phone": "+919876543211" },
    { "name": "Bob", "phone": "+919876543212" }
  ]
}
```

**Parameters Explained:**
- `action_name`: Name to show in the campaign history.
- `trigger_type`: Must be `"immediate"`.
- `leads`: Array of the selected contacts.

---

### Flow B: Simple Scheduled Campaign
**When to use:** The user selects a list of contacts but wants the system to call them all at a specific date and time in the future.

**Payload:**
```json
{
  "action_name": "Evening Reminder Broadcast",
  "trigger_type": "scheduled",
  "schedule_time": "2026-05-15T18:00:00Z", 
  "leads": [
    { "name": "David", "phone": "+919876543214" },
    { "name": "Eve", "phone": "+919876543215" }
  ]
}
```

**Parameters Explained:**
- `trigger_type`: Must be `"scheduled"`.
- `schedule_time` *(ISO 8601 Date String)*: The exact Date & Time the campaign should execute. Convert the user's local selected time to UTC (`new Date().toISOString()`) before sending.

---

### Flow C: Multi-Level Scheduled Campaign (Batched / Daily)
**When to use:** The user selects a massive list of contacts (e.g., 500 people) and wants to call them in smaller batches (e.g., 50 per day at 10:00 AM).

**Payload:**
```json
{
  "action_name": "500 Contacts over 10 Days",
  "trigger_type": "multi_level",
  "schedule_time": "2026-05-15T10:00:00Z",
  "batch_size": 50,
  "interval_minutes": 1440,
  "leads": [
    // ... all 500 leads go here ...
    { "name": "User 1", "phone": "+919000000001" },
    { "name": "User 2", "phone": "+919000000002" }
  ]
}
```

**Parameters Explained:**
- `trigger_type`: Must be `"multi_level"`.
- `schedule_time`: The date and time the **very first batch** should start.
- `batch_size` *(Number)*: How many contacts to call in a single batch (e.g., `50`).
- `interval_minutes` *(Number)*: The time gap between batches. 
  - *Example:* For daily campaigns at the same time, send `1440` (24 hours * 60 minutes). 
  - *Example:* For batches every 2 hours, send `120`.

---

## Response Handling

For all the endpoints above, a successful response will look like this:
```json
{
  "success": true,
  "actionId": "65e4a8b...123",
  "message": "Campaign scheduled successfully" // (or immediate success message)
}
```
You can use the `actionId` to fetch or display the progress of the campaign/call later using the Action Data endpoints below.

---

## 3. Action Analytics Endpoints

Use these endpoints to build a dashboard or history page showing all triggered calls and campaigns.

### Get All Actions (Campaign History)
**Endpoint:** `GET /api/ivr-agent/actions`
**Query Params (Optional):** `?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "65e4...",
      "action_name": "Summer Discount Blast",
      "operation": "campaign",
      "trigger_type": "immediate",
      "status": "completed",
      "total_contacts": 2,
      "contacted_count": 2,
      "created_time": "2026-05-14T10:00:00.000Z",
      "completed_time": "2026-05-14T10:05:00.000Z",
      "success_percentage": 50
    }
  ],
  "pagination": {
    "totalRecords": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 20
  }
}
```

### Get Action Details (Specific Campaign Details)
**Endpoint:** `GET /api/ivr-agent/actions/:actionId`

**Response:**
```json
{
  "success": true,
  "data": {
    "action_details": {
      "id": "65e4...",
      "action_name": "Summer Discount Blast",
      "operation": "campaign",
      "trigger_type": "immediate",
      "status": "completed",
      "total_contacts": 2,
      "contacted_count": 2,
      "created_time": "2026-05-14T10:00:00.000Z",
      "completed_time": "2026-05-14T10:05:00.000Z",
      "success_percentage": 50
    },
    "contacts": [
      {
        "call_uuid": "abc-123",
        "customer_name": "Alice",
        "customer_phone": "+919876543211",
        "status": "Answered",
        "call_status": "Completed",
        "duration": 45,
        "created_time": "2026-05-14T10:00:05.000Z"
      },
      {
        "call_uuid": "def-456",
        "customer_name": "Bob",
        "customer_phone": "+919876543212",
        "status": "Not Answered",
        "call_status": "Completed",
        "duration": 0,
        "created_time": "2026-05-14T10:00:06.000Z"
      }
    ]
  }
}
```
