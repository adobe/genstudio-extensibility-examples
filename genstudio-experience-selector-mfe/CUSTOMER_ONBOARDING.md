# 3rd Party Customer Onboarding Guide

This guide provides step-by-step instructions for 3rd party customers who want to integrate the GenStudio Experience Selector Micro-frontend (MFE) to access GenStudio experiences from their own web applications.

## Overview

3rd party customers integrating the Experience Selector MFE will:
- **NOT** be running under the Adobe Unified Shell
- Use their own custom domains (non-adobe.com) to host their web applications
- Need to trigger the SUSI (Sign-Up Sign-In) workflow for authentication
- Require proper IMS Client ID configuration for cross-origin access

The Experience Selector MFE handles the SUSI workflow internally, but proper configuration is required for the authentication and API access to function correctly.

## Prerequisites

Before beginning the onboarding process, ensure you have:
- A custom domain where customer web application is hosted (e.g., `https://yourcompany.com`)
- Access to Adobe IMSS: https://imss.corp.adobe.com/
- Access to Adobe I/O Console: https://admin.adobe.io/
- Customer Assets Essentials Environment information (e.g., programID, environmentID, IMSOrgID)

**Note:** 
- For ProgramID and EnvironmentID: customers can get this information from the Browser Network tab by searching for delivery requests
- For IMSOrgID: customers can get this information by pressing Ctrl + i and copying the IMSOrg string

## Onboarding Steps

### 1. Creating and Configuring an IMS Client ID

The IMS Client ID must be configured to allow redirects to your custom domain and support the SUSI authentication flow.

#### 1.1 Create a New IMS Client ID

1. Navigate to [https://imss.corp.adobe.com/#/new-client](https://imss.corp.adobe.com/#/new-client)
2. Create a new IMS Client ID with the following conventions (see IMS ClientID: genstudio-knak-experienceselectormfe for example):

**Recommended Naming Conventions:**
- **Environment**: Stage (create stage first, then copy to prod)
- **App Type**: Web
- **Client ID**: `genstudio-<CUSTOMER_NAME>-experienceselectormfe`
- **Product Name**: GenStudio for Performance Marketing
- **Team DL Contact**: `ORG-KMALL-ALL@adobe.com`
- **Business Unit**: Digital Experience - Marketing Cloud
- **Team Jira Project**: https://jira.corp.adobe.com/projects/GS


#### 1.2 Configure Client ID Settings

In the IMS Client configuration form, update the following settings:

**Required Configuration:**

1. **Redirect URL Patterns**:
   - Add your customer domain(s) to the allowed redirect list
   - Example: `https://enterprise\.(staging|testing)\.knak\.io`
   - Example (localhost for testing): `https://localhost:\S*`

2. **Scopes**:
   Add the following required scopes:
   ```
   additional_info.projectedProductContext
   read_organizations
   AdobeID
   openid
   ```

3. **Grant Types**:
   - Add the following to Grant Types:
   ```
   Implicit grant
   Authorization Code
   ```
4. **Client Admins**:
   - In addition to your email, also add the following:
   ```
   alliu@adobe.com
   chhatwal@adobe.com
   wingeier@adobe.com
   ```

#### 1.3 Create Production Client ID

After configuring the stage client ID:

1. Click the **Copy** button in the top right corner
2. Select **prod** environment
3. Review all settings
4. Click **Save** at the bottom of the form
5. Click **Confirm Settings** and review the disclaimer
6. Click **Confirm** again to finalize

---

### 2. Creating and Configuring an Adobe I/O Application

The Experience Selector uses Adobe Discovery Services, which requires your IMS Client ID to be subscribed in Adobe I/O.

#### 2.1 Create a New Adobe I/O Application

1. Navigate to [https://admin.adobe.io/](https://admin.adobe.io/)
2. Go to the **My Application** section of your organization (**GenStudio API Keys**)
3. Click **+ New Application**

**Recommended Settings:**
- **Name**: `GenStudio <CUSTOMER_NAME> Experience Selector MFE`
- **Description**: `Experience Selector implementation for <CUSTOMER_NAME> to subscribe to the Discovery Service`
- **Client Baseline**: Disabled
- **API Key**: Use the Client ID created in Step 1

#### 2.2 Subscribe to Discovery Service

After creating the application:

1. Click the **MANAGE** button on your application
2. Use the search field to find "AEM Discovery"
3. Click the **+ Add** button to subscribe to the service

---

### 3. Configure GenStudio Environment Access

Create a Cloud Manager customer support ticket with the following information.

> **Note:** If urgent, ping `#cloudmanager-oncall` Slack channel for assistance.

1. Log in to the HAL Browser with admin permissions:
https://git.corp.adobe.com/pages/experience-platform/self-service-hal-browser/#https://ssg.adobe.io/api/program/<CUSTOMER_PROGRAM_ID>/environment/<CUSTOMER_ENVIRONMENT_ID>/variables

2. Send a PATCH request to the endpoint to update the environment variables.
```bash
[
  {
    "name": "ADOBE_PROVIDED_CLIENT_ID",
    "value": "genstudio-<CUSTOMER_NAME>-experienceselectormfe",
    "type": "string",
    "service": "author"
  }
]
```
3. Get access to the namespace via the `#autosky-accessrequests` Slack channel and monitor pod restarts after making the request to Cloud Manager. Then shell to the new author pod and verify the environment variable:
```bash
sky use cm-pxxxx-exxxx
sky exec author
env |grep ADOBE_PROVIDED_CLIENT_ID
```

### 4. Configure Your Web Application

After completing the infrastructure setup, provide the SUSI Configuration below to the customer.

#### 4.1 Update SUSI Configuration

In your application code, configure the SUSI settings with your new client ID and scope:

```javascript
const experienceSelectorProps = {
  locale: 'en-US',
  apiKey: 'exc_app',                       
  imsOrg: 'CUSTOMER_IMS_ORG@AdobeOrg',            
  env: 'prod',                                  
  
  susiConfig: {
    clientId: 'genstudio-yourcompany-experience-selector',  // ← Client ID from step 1.1
    environment: 'prod',                       
    scope: 'additional_info.projectedProductContext,AdobeID,openid,read_organizations', // ← Scope from step 1.2
    locale: 'en_US',
    modalSettings: {
      width: 500,
      height: 700,
    },
  },
  
  // Event handlers
  onSelectionConfirmed: (experience) => {
    console.log('Selected:', experience);
  },
  onDismiss: () => {
    console.log('Dialog dismissed');
  },
};
```

## Testing Integration

### 1. Verify SUSI Authentication

1. Open your application in a browser
2. Click the button to open the Experience Selector
3. Verify that the SUSI login flow appears (if not already authenticated)
4. Complete authentication with your Adobe account
5. Verify that the Experience Selector dialog opens after authentication

### 2. Test Experience Selection

1. Browse available experiences
2. Apply filters if configured
3. Select one or more experiences
4. Verify that the `onSelectionConfirmed` callback receives the correct data
5. Test the `onDismiss` callback by closing the dialog without selecting

### 3. Troubleshooting

#### Authentication Fails

**Symptoms:**
- SUSI popup doesn't appear
- Authentication error messages
- Infinite redirect loops

**Solutions:**
- Verify your client ID is correctly configured in IMS
- Check that redirect URL patterns include your domain
- Confirm all required scopes are added
- Check browser console for detailed error messages


---

## Production Deployment Checklist

Before deploying to production:

- [ ] Production IMS Client ID created and configured
- [ ] Adobe I/O application created and subscribed to Discovery Service
- [ ] Client ID added to Assets Essentials Environment

---



**For questions or clarifications about this onboarding process, please contact the GenStudio engineering team.**

