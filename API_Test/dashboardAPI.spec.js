const { test, expect } = require('@playwright/test');

const loginData = require(`../fixtures/fixture.json`);

let access = '';
let refresh = '';
let remember = '';
let companyId = '';
let userId = '';
let yearList = [];

// Function to check if an object has specific properties of a given type
function checkProperties(data, properties, type) {
    if (Array.isArray(data)) {
        // If data is an array, iterate through each item and validate its properties
        data.forEach(item => {
            Object.entries(item).forEach(([key, value]) => {
                // For 'month' range, the keys should be valid numbers as strings
                if (properties.length === 0) {
                    // Check if the key is a valid number string
                    expect(!isNaN(parseInt(key, 10))).toBe(true);
                } else {
                    // Check if the key is in the list of valid keys
                    expect(properties.includes(key)).toBe(true);
                }
                // Check if the value is of the expected type
                expect(typeof value).toBe(type);
            });
        });
    } else {
        // If data is an object, check specific properties
        properties.forEach(prop => {
            expect(data).toHaveProperty(prop);
            expect(typeof data[prop]).toBe(type);
        });
    }
}


test.describe('Access/Refresh Token, User/Compay Id - Company Admin', () => {
    test ('Company Admin Login', async ({ request }) => {
        // api post request for login
        const response = await request.post('/api/v1/auth/user/login', {
            data: {
                email: `${loginData.valid.admin.email}`,
                password: `${loginData.valid.admin.password}`,
                rememberMe: true
            }
        });

        // expect a success status and gather data
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        access = responseBody.data.accessToken;
        refresh = responseBody.data.refreshToken;
        remember = responseBody.data.rememberToken;
        companyId = responseBody.data.user.initiallyInvitedByCompanyId;
        userId = responseBody.data.user.id;
    })
});

test.describe('Dashboard_008 - Company Admin', () => {
    test('Verify data of the Company Details Submodule within General Page', async ({ request }) => {
        //api get request for Company Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/company-overview`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
    
        expect(response.status()).toBe(200);
        let responseBody = await response.json();
    
        // Check that data.name is a non-empty string, i.e. a valid company name
        expect(responseBody.data.name.length).toBeGreaterThan(0);
    
        // Check valid logo image file (.jpeg or .jpg or .png)
        const imageUrlPattern = /\.(jpeg|jpg|png)$/i;
        expect(responseBody.data.logo).toMatch(imageUrlPattern);
    
        // Check if the company is active
        expect(responseBody.data.status).toBe(true);
    })
});

test.describe('Dashboard_014 - Company Admin', () => {
    test('Verify data of the Latest Clients Submodule within General Page', async ({ request }) => {
        //api get request for Latest Clients for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-clients`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
    
        expect(response.status()).toBe(200);
        let responseBody = await response.json();
    
        // Define the regex pattern for a valid email address
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Define the regex pattern for a typical image URL
        const imageUrlPattern = /\.(jpeg|jpg|png)$/i;
    
        // Iterate over the data array and validate each entry
        responseBody.data.forEach(client => {
            // Check that client.name is a non-empty string
            expect(typeof client.name).toBe('string');
            expect(client.name.length).toBeGreaterThan(0);
    
            // Check that client.id is a 25 character string
            expect(typeof client.id).toBe('string');
            expect(client.id.length).toBe(25);
    
            // Check that client.email matches the email pattern
            expect(client.email).toMatch(emailPattern);
    
            // Check that client.logo matches the image URL pattern
            expect(client.logo).toMatch(imageUrlPattern);
        });
    })
});

test.describe('Dashboard_016 - Company Admin', () => {
    test(`Verify the data from the Clients Overview Submodule's Donut Chart within the General Page`, async ({ request }) => {
        //api get request for Clients Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/clients-overview`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['total', 'active', 'inactive', 'archived'], 'number');
    })
});

test.describe('Dashboard_024 - Company Admin', () => {
    test(`Verify the data of the Employees Overview Submodule's Donut Chart within the General Page`, async ({ request }) => {
        //api get request for Employee Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/employees-overview`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['total'], 'number')
        checkProperties(responseBody.data.perRole, ['companyAdmin', 'payrollAdmin', 'approver', 'approver'], 'number');
    })
});

test.describe('Dashboard_030 - Company Admin', () => {
    test(`Verify data of the Latest Login Submodule within General Page`, async ({ request }) => {
        //api get request for Latest Login for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-logins`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that latest logged in user is the company admin
        expect(responseBody.data[0].id).toBe(userId);
    })
});

test.describe('Dashboard_033 - Company Admin', () => {
    test(`Verify the data of the Latest User Submodule's Bar Diagram within the User Page When 'Week' selected`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-users?range=week`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 'number');
    })
});

test.describe('Dashboard_034 - Company Admin', () => {
    test (`Verify the data of the Latest User Submodule's Bar Diagram within the User Page When 'Month' selected`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-users?range=month`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, [], 'number');
    })
});

test.describe('Dashboard_035 - Company Admin', () => {
    test(`Verify the data of the Latest User Submodule's Bar Diagram within the User Page When 'Year' selected`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-users?range=year`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 'number');
    })
});

test.describe('Dashboard_038 - Company Admin', () => {
    test(`Verify Year selection menu of the User By Year Submodule within he User Page`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/users-year-list`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        
        yearList = responseBody.data;
    })
});

test.describe('Dashboard_039 - Company Admin', () => {
    test(`Verify the data of the Users By Year Submodule's Line Graph within the User Page according to selected year`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/users-by-years?year=${yearList}`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 'number');
    })
});


test.describe('Access/Refresh Token, User/Compay Id - Payroll Admin', () => {
    test ('Payroll Admin Login', async ({ request }) => {
        // api post request for login
        const response = await request.post('/api/v1/auth/user/login', {
            data: {
                email: `${loginData.valid.payroll.email}`,
                password: `${loginData.valid.payroll.password}`,
                rememberMe: true
            }
        });

        // expect a success status and gather data
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        access = responseBody.data.accessToken;
        refresh = responseBody.data.refreshToken;
        remember = responseBody.data.rememberToken;
        companyId = responseBody.data.user.initiallyInvitedByCompanyId;
        userId = responseBody.data.user.id;
    })
});

test.describe('Dashboard_047 - Payroll Admin', () => {
    test('Verify data of the Company Details Submodule within General Page', async ({ request }) => {
        //api get request for Company Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/company-overview`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
    
        expect(response.status()).toBe(200);
        let responseBody = await response.json();
    
        // Check that data.name is a non-empty string, i.e. a valid company name
        expect(responseBody.data.name.length).toBeGreaterThan(0);
    
        // Check valid logo image file (.jpeg or .jpg or .png)
        const imageUrlPattern = /\.(jpeg|jpg|png)$/i;
        expect(responseBody.data.logo).toMatch(imageUrlPattern);
    
        // Check if the company is active
        expect(responseBody.data.status).toBe(true);
    })
});

test.describe('Dashboard_053 - Payroll Admin', () => {
    test('Verify data of the Latest Clients Submodule within General Page', async ({ request }) => {
        //api get request for Latest Clients for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-clients`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
    
        expect(response.status()).toBe(200);
        let responseBody = await response.json();
    
        // Define the regex pattern for a valid email address
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Define the regex pattern for a typical image URL
        const imageUrlPattern = /\.(jpeg|jpg|png)$/i;
    
        // Iterate over the data array and validate each entry
        responseBody.data.forEach(client => {
            // Check that client.name is a non-empty string
            expect(typeof client.name).toBe('string');
            expect(client.name.length).toBeGreaterThan(0);
    
            // Check that client.id is a 25 character string
            expect(typeof client.id).toBe('string');
            expect(client.id.length).toBe(25);
    
            // Check that client.email matches the email pattern
            expect(client.email).toMatch(emailPattern);
    
            // Check that client.logo matches the image URL pattern
            expect(client.logo).toMatch(imageUrlPattern);
        });
    })
});

test.describe('Dashboard_055 - Payroll Admin', () => {
    test(`Verify the data from the Clients Overview Submodule's Donut Chart within the General Page`, async ({ request }) => {
        //api get request for Clients Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/clients-overview`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['total', 'active', 'inactive', 'archived'], 'number');
    })
});

test.describe('Dashboard_063 - Payroll Admin', () => {
    test(`Verify the data of the Employees Overview Submodule's Donut Chart within the General Page`, async ({ request }) => {
        //api get request for Employee Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/employees-overview`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['total'], 'number')
        checkProperties(responseBody.data.perRole, ['companyAdmin', 'payrollAdmin', 'approver', 'approver'], 'number');
    })
});

test.describe('Dashboard_069 - Payroll Admin', () => {
    test(`Verify data of the Latest Login Submodule within General Page`, async ({ request }) => {
        //api get request for Latest Login for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-logins`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that latest logged in user is the company admin
        expect(responseBody.data[0].id).toBe(userId);
    })
});

test.describe('Dashboard_072 - Payroll Admin', () => {
    test(`Verify the data of the Latest User Submodule's Bar Diagram within the User Page When 'Week' selected`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-users?range=week`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 'number');
    })
});

test.describe('Dashboard_073 - Payroll Admin', () => {
    test (`Verify the data of the Latest User Submodule's Bar Diagram within the User Page When 'Month' selected`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-users?range=month`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, [], 'number');
    })
});

test.describe('Dashboard_074 - Payroll Admin', () => {
    test(`Verify the data of the Latest User Submodule's Bar Diagram within the User Page When 'Year' selected`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/latest-users?range=year`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 'number');
    })
});

test.describe('Dashboard_077 - Payroll Admin', () => {
    test(`Verify Year selection menu of the User By Year Submodule within he User Page`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/users-year-list`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        
        yearList = responseBody.data;
    })
});

test.describe('Dashboard_078 - Payroll Admin', () => {
    test(`Verify the data of the Users By Year Submodule's Line Graph within the User Page according to selected year`, async ({ request }) => {
        //api get request for Latest User (Week) for given Company Id
        const response = await request.get(`/api/v1/dashboards/company-admins/${companyId}/users-by-years?year=${yearList}`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
        
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        // Check that responseBody.data contains the required data
        checkProperties(responseBody.data, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 'number');
    })
});


test.describe('Access/Refresh Token, User/Compay Id - Approver', () => {
    test ('Approver Login', async ({ request }) => {
        // api post request for login
        const response = await request.post('/api/v1/auth/user/login', {
            data: {
                email: `${loginData.valid.approver.email}`,
                password: `${loginData.valid.approver.password}`,
                rememberMe: true
            }
        });

        // expect a success status and gather data
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        access = responseBody.data.accessToken;
        refresh = responseBody.data.refreshToken;
        remember = responseBody.data.rememberToken;
        companyId = responseBody.data.user.initiallyInvitedByCompanyId;
        userId = responseBody.data.user.id;
    })
});

test.describe('Dashboard_084 - Approver', () => {
    test('Verify data of the Company Details Submodule within General Page', async ({ request }) => {
        //api get request for Company Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/approvers/${companyId}/company-overview`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
    
        expect(response.status()).toBe(200);
        let responseBody = await response.json();
    
        // Check that data.name is a non-empty string, i.e. a valid company name
        expect(responseBody.data.name.length).toBeGreaterThan(0);
    
        // Check valid logo image file (.jpeg or .jpg or .png)
        const imageUrlPattern = /\.(jpeg|jpg|png)$/i;
        expect(responseBody.data.logo).toMatch(imageUrlPattern);
    
        // Check if the company is active
        expect(responseBody.data.status).toBe(true);
    })
});

test.describe('Dashboard_091 - Approver', () => {
    test('Verify data of the Latest Timesheets Submodule within General Page', async ({ request }) => {
        //api get request for Company Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/approvers/${companyId}/latest-timesheets`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
    
        expect(response.status()).toBe(200);
        let responseBody = await response.json();
    
        // Check that less than 5 latest timesheet data are sent 
        expect(responseBody.data.length).toBeLessThanOrEqual(5);
    })
});


test.describe('Access/Refresh Token, User/Compay Id - Employee', () => {
    test ('Employee Login', async ({ request }) => {
        // api post request for login
        const response = await request.post('/api/v1/auth/user/login', {
            data: {
                email: `${loginData.valid.employee.email}`,
                password: `${loginData.valid.employee.password}`,
                rememberMe: true
            }
        });

        // expect a success status and gather data
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        access = responseBody.data.accessToken;
        refresh = responseBody.data.refreshToken;
        remember = responseBody.data.rememberToken;
        companyId = responseBody.data.user.initiallyInvitedByCompanyId;
        userId = responseBody.data.user.id;
    })
});

test.describe('Dashboard_084 - Employee', () => {
    test('Verify data of the Company Details Submodule within General Page', async ({ request }) => {
        //api get request for Company Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/employees/${companyId}/company-overview`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
    
        expect(response.status()).toBe(200);
        let responseBody = await response.json();
    
        // Check that data.name is a non-empty string, i.e. a valid company name
        expect(responseBody.data.name.length).toBeGreaterThan(0);
    
        // Check valid logo image file (.jpeg or .jpg or .png)
        const imageUrlPattern = /\.(jpeg|jpg|png)$/i;
        expect(responseBody.data.logo).toMatch(imageUrlPattern);
    
        // Check if the company is active
        expect(responseBody.data.status).toBe(true);
    })
});

test.describe('Dashboard_091 - Employee', () => {
    test('Verify data of the Latest Timesheets Submodule within General Page', async ({ request }) => {
        //api get request for Company Overview for given Company Id
        const response = await request.get(`/api/v1/dashboards/employees/${companyId}/latest-timesheets`, {
            headers: {
                // Bearer token authentication taken from Admin login
                "Authorization": `Bearer ${access}`
            }
        });
    
        expect(response.status()).toBe(200);
        let responseBody = await response.json();
    
        // Check that less than 5 latest timesheet data are sent 
        expect(responseBody.data.length).toBeLessThanOrEqual(5);
    })
});