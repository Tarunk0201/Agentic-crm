# IVR Script Management API Documentation

This document provides a detailed guide for the API endpoints used to manage IVR (Interactive Voice Response) scripts for tenants.

## Base URL

All endpoints documented here are relative to the following base URL:

`/api/ivr-agent`

## Authentication

All endpoints are protected and require a valid tenant-specific JWT to be sent in the `Authorization` header.

**Header:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

---

## Endpoints

### 1. Get All Scripts for a Tenant

Retrieves a list of all IVR scripts belonging to the authenticated tenant.

- **Method:** `GET`
- **URL:** `/scripts`
- **Success Response (200 OK):** An array of script objects.

  ```json
  [
    {
      "_id": "6a06c25d2dcc9395d8c288fe",
      "tenantId": "6a041d0f161304cbeeef2e8a",
      "scriptName": "My Custom IVR",
      "scriptBody": {
        "start_node": "node_greeting",
        "nodes": { ... }
      },
      "isActive": false,
      "createdAt": "2026-05-15T06:51:09.701Z",
      "updatedAt": "2026-05-15T06:51:09.701Z"
    }
  ]
  ```

### 2. Create a New Script

Creates a new IVR script for the tenant.

- **Method:** `POST`
- **URL:** `/scripts`
- **Request Body:** A JSON object containing the `scriptName` and the `scriptBody`.

  ```json
  {
    "scriptName": "Sales and Support IVR",
    "scriptBody": {
      "start_node": "node_greeting",
      "nodes": {
        "node_greeting": {
          "type": "menu",
          "text": "Welcome! Press 1 for sales, or press 2 for support.",
          "invalid_text": "Invalid option.",
          "branches": {
            "1": "node_forward_sales",
            "2": "node_forward_support"
          }
        },
        "node_forward_sales": {
          "type": "action_forward",
          "text": "Forwarding to sales.",
          "end_call": true
        },
        "node_forward_support": {
          "type": "action_forward",
          "text": "Forwarding to support.",
          "end_call": true
        }
      }
    }
  }
  ```

- **Success Response (201 Created):** The newly created script object.
- **Error Responses:**
  - `400 Bad Request`: If `scriptName` or `scriptBody` is missing, or if the script structure is invalid.

### 3. Get a Specific Script

Retrieves the full details of a single script by its ID.

- **Method:** `GET`
- **URL:** `/scripts/:scriptId`
- **Path Parameter:**
  - `scriptId` (string, required): The unique ID of the script to retrieve.
- **Success Response (200 OK):** The requested script object.

### 4. Update a Script

Updates an existing IVR script.

- **Method:** `PUT`
- **URL:** `/scripts/:scriptId`
- **Path Parameter:**
  - `scriptId` (string, required): The unique ID of the script to update.
- **Request Body:** A JSON object containing the fields to update (`scriptName` and/or `scriptBody`).

  > **Note:** When updating `scriptBody`, the entire object must be sent, as it will fully replace the existing one.

  ```json
  {
    "scriptName": "Updated Sales IVR",
    "scriptBody": {
      "start_node": "node_greeting",
      "nodes": {
        "node_greeting": {
          "type": "menu",
          "text": "Welcome to the updated sales line! Press 1 to connect.",
          "branches": {
            "1": "node_forward_sales"
          }
        },
        "node_forward_sales": {
          "type": "action_forward",
          "text": "Connecting you now.",
          "end_call": true
        }
      }
    }
  }
  ```

- **Success Response (200 OK):** The updated script object.
- **Error Responses:**
  - `404 Not Found`: If no script with the given `scriptId` is found for the tenant.

### 5. Delete a Script

Deletes a script from the tenant's account.

- **Method:** `DELETE`
- **URL:** `/scripts/:scriptId`
- **Path Parameter:**
  - `scriptId` (string, required): The unique ID of the script to delete.
- **Success Response (200 OK):**
  ```json
  {
    "message": "Script deleted successfully."
  }
  ```
- **Error Responses:**
  - `404 Not Found`: If the script to be deleted is not found.

### 6. Toggle Active Status

Sets a script as the "active" one for the tenant. When a script is activated, all other scripts for that tenant are automatically deactivated. It can also be used to deactivate the currently active script.

- **Method:** `PATCH`
- **URL:** `/scripts/:scriptId/toggle-active`
- **Path Parameter:**
  - `scriptId` (string, required): The ID of the script to toggle.
- **Success Response (200 OK):**
  ```json
  {
    "message": "Script status updated. Active: true",
    "script": { ... } // The updated script object
  }
  ```
- **Error Responses:**
  - `404 Not Found`: If the script to be toggled is not found.
