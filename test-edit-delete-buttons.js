/**
 * Test script to verify edit/delete buttons are working in master data tables
 */

const puppeteer = require('puppeteer');

async function testEditDeleteButtons() {
    console.log('🚀 Starting Edit/Delete Buttons Test...\n');

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Go to the main dashboard
        console.log('📡 Navigating to dashboard...');
        await page.goto('http://localhost:3000/dashboard');

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Test colors page first
        console.log('🎯 Testing Colors page...');
        await page.goto('http://localhost:3000/dashboard/master-data/colors');
        await page.waitForTimeout(3000);

        // Check if any data loaded
        const dataRows = await page.$$('table tbody tr');
        console.log(`📊 Found ${dataRows.length} data rows in colors table`);

        if (dataRows.length > 0) {
            // Look for action column with buttons
            const actionButtons = await page.$$('table tbody button');
            console.log(`🔘 Found ${actionButtons.length} buttons in table`);

            // Check for dropdown triggers (the "..." menu)
            const dropdownTriggers = await page.$$('button[data-state="closed"], button.p-0');
            console.log(`⚡ Found ${dropdownTriggers.length} dropdown triggers`);

            if (dropdownTriggers.length > 0) {
                console.log('✅ Dropdown triggers found! Testing click...');

                // Click first dropdown to show menu
                await dropdownTriggers[0].click();
                await page.waitForTimeout(500);

                // Check for edit/delete options in dropdown
                const editOptions = await page.$$('a[role="menuitem"], div[role="menuitem"]');
                console.log(`📝 Found ${editOptions.length} menu options`);

                if (editOptions.length > 0) {
                    console.log('✅ Edit/Delete options are available in dropdown!');

                    // Get text of menu options
                    for (let i = 0; i < editOptions.length; i++) {
                        const text = await editOptions[i].evaluate(el => el.textContent.trim());
                        console.log(`   - Option ${i + 1}: "${text}"`);
                    }
                } else {
                    console.log('❌ No menu options found after clicking dropdown');
                }
            } else {
                console.log('❌ No dropdown triggers found in table rows');
            }

            // Look for any element with "Edit" or "Delete" text
            const editTextElements = await page.$$('text="Edit", text="Delete"');
            console.log(`🔍 Found ${editTextElements.length} elements with Edit/Delete text`);

        } else {
            console.log('⚠️ No data rows found - table might be empty or still loading');
        }

        // Check console logs for CRUDTable component
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('[CRUDTable]') || text.includes('[Colors]')) {
                console.log(`📋 Console: ${text}`);
            }
        });

        // Also test vehicle-types page
        console.log('\n🎯 Testing Vehicle Types page...');
        await page.goto('http://localhost:3000/dashboard/master-data/vehicle-types');
        await page.waitForTimeout(3000);

        const vehicleDataRows = await page.$$('table tbody tr');
        console.log(`📊 Found ${vehicleDataRows.length} data rows in vehicle types table`);

        if (vehicleDataRows.length > 0) {
            const vehicleDropdowns = await page.$$('button.p-0, button[data-state="closed"]');
            console.log(`⚡ Found ${vehicleDropdowns.length} dropdown triggers in vehicle types`);
        }

        // Test categories page
        console.log('\n🎯 Testing Categories page...');
        await page.goto('http://localhost:3000/dashboard/master-data/categories');
        await page.waitForTimeout(3000);

        const categoriesDataRows = await page.$$('table tbody tr');
        console.log(`📊 Found ${categoriesDataRows.length} data rows in categories table`);

        if (categoriesDataRows.length > 0) {
            const categoriesDropdowns = await page.$$('button.p-0, button[data-state="closed"]');
            console.log(`⚡ Found ${categoriesDropdowns.length} dropdown triggers in categories`);
        }

        console.log('\n🎯 Test Summary:');
        console.log('='.repeat(50));
        console.log('1. Colors page: ' + (dataRows.length > 0 ? 'Has data' : 'No data'));
        console.log('2. Vehicle Types page: ' + (vehicleDataRows.length > 0 ? 'Has data' : 'No data'));
        console.log('3. Categories page: ' + (categoriesDataRows.length > 0 ? 'Has data' : 'No data'));

        console.log('\n🔍 Action Column Investigation:');
        console.log('Expected: Each row should have a "..." button that opens dropdown with Edit/Delete options');
        console.log('Actual: Check the results above for dropdown triggers found');

        console.log('\n💡 Next Steps:');
        console.log('1. If data rows exist but no dropdowns: CRUDTable action column not working');
        console.log('2. If dropdowns exist but no menu items: onEdit/onDelete props not passed correctly');
        console.log('3. If no data rows: API endpoints not working or authentication issues');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testEditDeleteButtons();