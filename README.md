# Velorona_API_Testing
A new Repo for API Testing

## Setting up the project:
- npm init playwright@latest

-- Do you want to use TypeScript or JavaScript? (JavaScript)

-- Where to put your end-to-end tests? (tests)

-- Add a GitHub Actions workflow? (false)

-- Install Playwright browsers (can be done manually via 'npx playwright install')? (true)

- Inside playwright.config.ja

-- testDir: './API_Test',

-- update base url:

    use: {

            baseURL: 'Base URL for API Testing in Staging environment',

            ...

        }

-- comment down the following (We will not be using these browsers for now):

        {

        name: 'firefox',

        use: { ...devices['Desktop Firefox'] },

        },

        {

        name: 'webkit',

        use: { ...devices['Desktop Safari'] },

        },

## ./fixture/
- fixture.json

-- contains emails, password and other testing datas

