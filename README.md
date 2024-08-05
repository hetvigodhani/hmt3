# How to run the project

1. Clone the repository
2. Run `npm install` to install all dependencies
3. Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=3000
CORS_ORIGIN=
MONGODB_URI=mongodb://localhost:27017
REFRESH_TOKEN_SECRET=helloAndWelcomeToWizDevelopers
REFRESH_TOKEN_EXPIRY=7d
ACCESS_TOKEN_SECRET=theAccessTokenIsAmazing
ACCESS_TOKEN_EXPIRY=1d
APP_ENV=development
EMAIL=
EMAIL_PASSWORD=
```

4. Run `npm run dev` to start the development server

# Wiz Developers Backend

## General Instructions

-   All routes are prefixed with `/api/v1`
-   All routes are protected except for the `register` and `login` routes
-   All routes are protected by the `auth` middleware
-   Response Format:

```json
{
    "StatusCode": 200,
    "message": "Test Route",
    "success": true,
    "data": {
        // data would be object or json data
        "details": "just for trying"
    }
}
```

-   Error Format:

```json
{
    "StatusCode": 400,
    "message": "Test Route",
    "success": false,
    "errors": "just for trying" //errors would be string
}
```

-   All protected routes pass through the `auth` middleware
-   statuscode:
    -   200: Success
    -   201: Created
    -   204: No Content
    -   400: Bad Request
    -   401: Unauthorized
    -   403: Forbidden
    -   404: Not Found
    -   500: Internal Server Error
-   We have certain constants defined in `src/constants.js` file
-   Address Format:

    ```json
    {
        "street": "123 Main St",
        "city": "City",
        "state": "State",
        "zipCode": "12345", //trimmed, length must be 5
        "country": "Country"
    }
    ```

## Patient Routes

-   base url: `/api/v1/patient`
-   **Schema**

| Field                        | Type          | Required | Description                                                                    |
| ---------------------------- | ------------- | -------- | ------------------------------------------------------------------------------ |
| username                     | String        | Yes      | Unique username, 3-100 characters long                                         |
| password                     | String        | Yes      | User password                                                                  |
| bloodgroup                   | String        | Yes      | Blood group, must be one of ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] |
| refreshToken                 | String        | No       | Refresh token for authentication                                               |
| isInactive                   | Boolean       | No       | Indicates if the account is inactive, default is false                         |
| firstName                    | String        | Yes      | First name, at least 1 character long                                          |
| lastName                     | String        | Yes      | Last name, at least 1 character long                                           |
| dateOfBirth                  | Date          | Yes      | Date of birth                                                                  |
| gender                       | String        | Yes      | Gender, must be one of ["Male", "Female", "Other"]                             |
| phoneNumber                  | String        | Yes      | Phone number, must be valid international format                               |
| alternatePhoneNumber         | String        | Yes      | Alternate phone number, must be valid international format                     |
| email                        | String        | Yes      | Unique email address, trimmed                                                  |
| alternateEmail               | String        | No       | Alternate email address, trimmed                                               |
| address                      | addressSchema | Yes      | Address details                                                                |
| emergencyContactName         | String        | Yes      | Emergency contact name, at least 3 characters long                             |
| emergencyContactRelationship | String        | No       | Emergency contact relationship, at least 3 characters                          |
| emergencyContactPhoneNumber  | String        | Yes      | Emergency contact phone number, must be valid international format             |
| profilePicture               | String        | No       | URL to profile picture                                                         |
| chronicConditions            | [String]      | No       | List of chronic conditions, each at least 3 characters                         |
| pastSurgeries                | [String]      | No       | List of past surgeries                                                         |
| allergies                    | [String]      | No       | List of allergies, each at least 3 characters                                  |
| medications                  | [String]      | No       | List of medications                                                            |
| insuranceProvider            | String        | No       | Insurance provider                                                             |
| policyNumber                 | String        | No       | Policy number                                                                  |
| coverageDetails              | String        | No       | Coverage details                                                               |
| primaryCarePhysician         | String        | No       | Primary care physician                                                         |
| physicianContactInfo         | String        | No       | Physician contact info                                                         |
| nurseNotes                   | String        | No       | Nurse notes                                                                    |
| aadharCard                   | String        | Yes      | Unique Aadhar card number, 12 characters long                                  |
| panCard                      | String        | Yes      | Unique PAN card number, 10 characters long                                     |
| labResults                   | [String]      | No       | List of lab results                                                            |

### Register patient

-   **URL:** `/register`
-   **Method:** POST
-   **Description:** Registers a new patient.
-   **Request Body:** Form data including profile picture.
-   **Access:** Public

### Login Patient

-   **URL:** `/login`
-   **Method:** POST
-   **Description:** Logs in a patient.
-   **Access:** Public

### Logout Patient

-   **URL:** `/logout`
-   **Method:** POST
-   **Description:** Logs out a patient.
-   **Access:** Private

### Refresh Access Token

-   **URL:** `/refresh-token`
-   **Method:** POST
-   **Description:** Refreshes doctor access token.
-   **Access:** Private

## Doctor Routes

-   base url: `/api/v1/doctor`
-   **Schema**

| Field                | Type          | Required | Description                                            |
| -------------------- | ------------- | -------- | ------------------------------------------------------ |
| username             | String        | Yes      | Unique username, 3-100 characters long                 |
| password             | String        | Yes      | User password                                          |
| refreshToken         | String        | No       | Refresh token for authentication                       |
| isInactive           | Boolean       | No       | Indicates if the account is inactive, default is false |
| role                 | String        | No       | User role, default is DOCTOR                           |
| firstName            | String        | Yes      | First name, at least 2 characters long                 |
| lastName             | String        | Yes      | Last name, at least 2 characters long                  |
| dateOfBirth          | Date          | Yes      | Date of birth                                          |
| gender               | String        | Yes      | Gender, can be "Male", "Female", or "Other"            |
| phoneNumber          | String        | Yes      | Phone number, must be valid international format       |
| email                | String        | Yes      | Unique email address, trimmed                          |
| address              | addressSchema | Yes      | Address details                                        |
| profilePicture       | String        | No       | URL to profile picture                                 |
| qualification        | String        | Yes      | Qualification, at least 3 characters long              |
| specialization       | String        | Yes      | Field of specialization                                |
| yearsOfExperience    | Number        | No       | Number of years of experience, minimum is 0            |
| hospitalAffiliation  | String        | Yes      | Affiliated hospital                                    |
| licenseNumber        | String        | Yes      | Unique license number                                  |
| primaryClinicAddress | String        | No       | Primary clinic address                                 |
| clinicPhoneNumber    | String        | No       | Clinic phone number, 10-15 characters long             |
| clinicEmail          | String        | No       | Clinic email address, trimmed                          |
| consultationFees     | Number        | No       | Consultation fees, default is 0.0                      |
| notes                | String        | No       | Additional notes                                       |

### Register Doctor

-   **URL:** `/register`
-   **Method:** POST
-   **Description:** Registers a new doctor.
-   **Request Body:** Form data including profile picture.
-   **Access:** Public

### Login Doctor

-   **URL:** `/login`
-   **Method:** POST
-   **Description:** Logs in a doctor.
-   **Access:** Public

### Logout Doctor

-   **URL:** `/logout`
-   **Method:** POST
-   **Description:** Logs out a doctor.
-   **Access:** Private

### Update Doctor

-   **URL:** `/update/:id`
-   **Method:** PUT
-   **Description:** Updates a doctor.
-   **Access:** Private

### Get Doctor By

-   **URL:** `/id/:id`
-   **URL:** `/phoneNumber/:phoneNumber`
-   **URL:** `/email/:email`
-   **URL:** `/username/:username`
-   **Method:** GET
-   **Description:** Retrieves a doctor by paramater.
-   **Access:** Public

### Refresh Access Token

-   **URL:** `/refresh-token`
-   **Method:** POST
-   **Description:** Refreshes doctor access token.
-   **Access:** Private

### Get All Doctors

-   **URL:** `/doctors`
-   **Method:** POST
-   **Description:** Logs out a doctor.
-   **Access:** Private

## User Routes

base url: `/api/v1/user`
**Schema**
| Field | Type | Required | Description |
|---------------|----------|----------|--------------------------------------------|
| username | String | Yes | User's username, 3 to 100 characters |
| password | String | Yes | User's password |
| role | String | Yes | User's role (must be one of `roleEnum`) |
| fullName | String | Yes | User's full name |
| email | String | Yes | User's email (must be unique) |
| phoneNumber | String | No | User's phone number (validated format) |
| dateOfBirth | Date | Yes | User's date of birth |
| gender | String | Yes | User's gender (must be one of `genderEnum`)|
| address | Object | No | User's address (using `addressSchema`) |
| refreshToken | String | No | User's refresh token for authentication |
| profilePicture| String | No | URL to user's profile picture |
| isInactive | Boolean | No | Indicates if user account is inactive |

### Register User

-   **URL:** `/register`
-   **Method:** POST
-   **Description:** Registers a new doctor.
-   **Request Body:** Form data including profile picture.
-   **Access:** Public

### Login User

-   **URL:** `/login`
-   **Method:** POST
-   **Description:** Logs in a user.
-   **Access:** Public

### Get User By ID

-   **URL:** `/id/:id`
-   **Method:** GET
-   **Description:** Retrieves a user by ID.
-   **Access:** Public

### Get User By Email

-   **URL:** `/email/:email`
-   **Method:** GET
-   **Description:** Retrieves a user by email.
-   **Access:** Public

### Get User By Phone Number

-   **URL:** `/phone/:phoneNumber`
-   **Method:** GET
-   **Description:** Retrieves a user by phone number.
-   **Access:** Public

### Get User By Role

-   **URL:** `/role/:role`
-   **Method:** GET
-   **Description:** Retrieves users by role.
-   **Access:** Public

### Get All Users

-   **URL:** `/users`
-   **Method:** GET
-   **Description:** Retrieves all users.
-   **Access:** Private (Admin Only)

### Logout User

-   **URL:** `/logout`
-   **Method:** POST
-   **Description:** Logs out a user.
-   **Access:** Private

### Refresh Access Token

-   **URL:** `/refresh-token`
-   **Method:** POST
-   **Description:** Refreshes user access token.
-   **Access:** Private

## Record Routes

base url: `/api/v1/record`

### Add Record

-   **URL:** `/add-record`
-   **Method:** POST
-   **Description:** Adds a new medical record.
-   **Request Body:** Form data with multiple record URLs.
-   **Access:** Private

### Get Record

-   **URL:** `/get-record`
-   **Method:** GET
-   **Description:** Retrieves a medical record.
-   **Access:** Private

### Update Record

-   **URL:** `/update-record`
-   **Method:** PATCH
-   **Description:** Updates a medical record.
-   **Request Body:** Form data with multiple record URLs.
-   **Access:** Private

### Delete Record

-   **URL:** `/delete-record`
-   **Method:** DELETE
-   **Description:** Deletes a medical record.
-   **Access:** Private

## Appointment Routes

base url: `/api/v1/appointment`

### Add Appointment

-   **URL:** `/add-appointment`
-   **Method:** POST
-   **Description:** Adds a new appointment.
-   **Access:** Private

### Get Appointment

-   **URL:** `/get-appointment`
-   **Method:** GET
-   **Description:** Retrieves an appointment.
-   **Access:** Private

### Update Appointment

-   **URL:** `/update-appointment/:id`
-   **Method:** PUT
-   **Description:** Updates an appointment.
-   **Access:** Private

### Cancel Appointment

-   **URL:** `/cancel-appointment/:id`
-   **Method:** DELETE
-   **Description:** Cancels an appointment.
-   **Access:** Private

### Reschedule Appointment

-   **URL:** `/reschedule-appointment/:id`
-   **Method:** PUT
-   **Description:** Reschedules an appointment.
-   **Access:** Private

### Add Follow-Up

-   **URL:** `/follow-up/:id`
-   **Method:** POST
-   **Description:** Adds a follow-up for an appointment.
-   **Access:** Private

### Send Reminders

-   **URL:** `/send-reminders`
-   **Method:** POST
-   **Description:** Sends reminders for appointments.
-   **Access:** Private
