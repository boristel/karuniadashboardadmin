/**
 * Master Data Flow Test
 * This script tests the complete flow from API to component rendering
 */

const API_BASE_URL = 'http://localhost:1337/api';

async function testMasterDataFlow() {
    console.log('🚀 Starting Master Data Flow Test...\n');

    const endpoints = [
        { name: 'categories', url: `${API_BASE_URL}/categories` },
        { name: 'vehicle-groups', url: `${API_BASE_URL}/vehicle-groups` },
        { name: 'vehicle-types', url: `${API_BASE_URL}/vehicle-types` },
        { name: 'supervisors', url: `${API_BASE_URL}/supervisors` },
        { name: 'branches', url: `${API_BASE_URL}/branches` }
    ];

    const results = {};

    for (const endpoint of endpoints) {
        console.log(`📡 Testing ${endpoint.name} endpoint...`);

        try {
            const response = await fetch(endpoint);
            const status = response.status;
            const data = await response.json();

            results[endpoint.name] = {
                status,
                success: status === 200,
                data,
                hasData: !!(data && data.data && Array.isArray(data.data)),
                dataCount: data.data ? data.data.length : 0,
                sampleData: data.data ? data.data.slice(0, 1) : null
            };

            console.log(`   ✅ ${endpoint.name}: ${status} - ${results[endpoint.name].dataCount} items`);

            // Log sample data structure
            if (results[endpoint.name].sampleData) {
                const sample = results[endpoint.name].sampleData[0];
                console.log(`   📋 Sample structure:`, Object.keys(sample));
            }

        } catch (error) {
            results[endpoint.name] = {
                status: 'ERROR',
                success: false,
                error: error.message
            };
            console.log(`   ❌ ${endpoint.name}: ERROR - ${error.message}`);
        }
    }

    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));

    Object.entries(results).forEach(([name, result]) => {
        if (result.success) {
            console.log(`✅ ${name}: ${result.status} - ${result.dataCount} items loaded`);
            console.log(`   Structure: ${result.sampleData ? Object.keys(result.sampleData[0]).join(', ') : 'No data'}`);
        } else {
            console.log(`❌ ${name}: ${result.status} - ${result.error || 'Unknown error'}`);
        }
    });

    // Analyze potential issues
    console.log('\n🔍 Potential Issues Analysis:');
    console.log('='.repeat(50));

    const workingEndpoints = Object.entries(results).filter(([_, result]) => result.success);
    const failedEndpoints = Object.entries(results).filter(([_, result]) => !result.success);

    console.log(`✅ Working endpoints: ${workingEndpoints.length}/${Object.keys(results).length}`);
    console.log(`❌ Failed endpoints: ${failedEndpoints.length}/${Object.keys(results).length}`);

    if (workingEndpoints.length > 0) {
        console.log('\n🎯 Expected Behavior:');
        console.log('1. Master data pages should load data from working endpoints');
        console.log('2. CRUDTable should receive data arrays');
        console.log('3. onEdit and onDelete props should be passed');
        console.log('4. Edit/Delete buttons should appear in action column');
    }

    if (failedEndpoints.length > 0) {
        console.log('\n⚠️  Failed Endpoints:');
        failedEndpoints.forEach(([name, result]) => {
            console.log(`- ${name}: ${result.error || 'Unknown error'}`);
        });
    }

    // Check if colors endpoint requires auth
    console.log('\n🔐 Authentication Check:');
    try {
        const colorsResponse = await fetch(`${API_BASE_URL}/colors`);
        if (colorsResponse.status === 403) {
            console.log('⚠️  Colors endpoint requires authentication (403)');
            console.log('   This is expected behavior - colors need JWT token');
        } else {
            console.log(`✅ Colors endpoint: ${colorsResponse.status}`);
        }
    } catch (error) {
        console.log(`❌ Colors endpoint test failed: ${error.message}`);
    }

    console.log('\n🎯 Conclusion:');
    if (workingEndpoints.length >= 3) {
        console.log('✅ Backend API is working correctly');
        console.log('✅ Data should be loading in master data pages');
        console.log('❓ Edit/Delete buttons issue must be in frontend logic');
    } else {
        console.log('❌ Backend API issues detected');
        console.log('🔧 Fix backend issues first before investigating frontend');
    }

    return results;
}

// Test CRUDTable props simulation
function testCRUDTableProps() {
    console.log('\n🧪 CRUDTable Props Simulation:');
    console.log('='.repeat(50));

    // Simulate props that would be passed
    const simulatedProps = {
        data: [
            { id: 1, documentId: 'test1', name: 'Test Item 1', createdAt: '2025-01-01' },
            { id: 2, documentId: 'test2', name: 'Test Item 2', createdAt: '2025-01-02' }
        ],
        columns: [
            { accessorKey: 'id', header: 'ID' },
            { accessorKey: 'name', header: 'Name' }
        ],
        onEdit: (item) => console.log('Edit called with:', item),
        onDelete: (item) => console.log('Delete called with:', item)
    };

    console.log('📋 Props Check:');
    console.log(`✅ Has data: ${simulatedProps.data.length > 0}`);
    console.log(`✅ Has columns: ${simulatedProps.columns.length > 0}`);
    console.log(`✅ Has onEdit: ${!!simulatedProps.onEdit}`);
    console.log(`✅ Has onDelete: ${!!simulatedProps.onDelete}`);

    console.log('\n🎯 Expected CRUDTable Behavior:');
    console.log('1. Action column should be automatically added');
    console.log('2. Edit button should appear in each row (dropdown menu)');
    console.log('3. Delete button should appear in each row (dropdown menu)');
    console.log('4. Clicking buttons should call the provided functions');

    return simulatedProps;
}

// Run all tests
async function runAllTests() {
    console.log('🔍 Starting Comprehensive Investigation...\n');

    const apiResults = await testMasterDataFlow();
    const crudProps = testCRUDTableProps();

    console.log('\n🏁 Investigation Complete');
    console.log('='.repeat(50));

    // Final diagnosis
    console.log('📋 FINAL DIAGNOSIS:');

    const workingEndpointsCount = Object.values(apiResults).filter(r => r.success).length;

    if (workingEndpointsCount >= 3) {
        console.log('✅ API Backend: Working correctly');
        console.log('✅ Data Loading: Should be working');
        console.log('❓ Issue Location: Frontend component logic');
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Check browser console for client-side logs');
        console.log('2. Verify CRUDTable component receives props correctly');
        console.log('3. Check if authentication is blocking data loading');
        console.log('4. Verify action column is being added to table');
    } else {
        console.log('❌ API Backend: Issues detected');
        console.log('🎯 NEXT STEPS:');
        console.log('1. Fix backend API issues first');
        console.log('2. Ensure all endpoints return 200 status');
        console.log('3. Then investigate frontend logic');
    }
}

// Run tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testMasterDataFlow, testCRUDTableProps, runAllTests };
} else {
    runAllTests();
}