const fs = require('fs');
const path = require('path');

// Load files
const workDays = JSON.parse(fs.readFileSync(path.join(__dirname, 'work_days.json'), 'utf8'));
const workingDays = JSON.parse(fs.readFileSync(path.join(__dirname, 'working_days.json'), 'utf8'));

console.log('🔍 Validating work days configuration...\n');

let hasErrors = false;

// Group working days by month
const workingDaysByMonth = {};
workingDays.forEach(dateStr => {
    const yearMonth = dateStr.replace(/-/g, '').substring(0, 6);
    if (!workingDaysByMonth[yearMonth]) {
        workingDaysByMonth[yearMonth] = [];
    }
    workingDaysByMonth[yearMonth].push(dateStr);
});

// Validate each month
Object.keys(workDays).sort().forEach(yearMonth => {
    const expectedDays = workDays[yearMonth];
    const actualDays = workingDaysByMonth[yearMonth] || [];
    const actualCount = actualDays.length;
    
    const year = yearMonth.substring(0, 4);
    const month = yearMonth.substring(4, 6);
    
    if (actualCount !== expectedDays) {
        hasErrors = true;
        console.log(`❌ ${year}-${month}: Expected ${expectedDays} days, found ${actualCount} days`);
        console.log(`   Missing: ${expectedDays - actualCount} days\n`);
    } else {
        console.log(`✅ ${year}-${month}: ${actualCount} days (correct)`);
    }
});

// Check for extra months in working_days.json
Object.keys(workingDaysByMonth).forEach(yearMonth => {
    if (!workDays[yearMonth]) {
        hasErrors = true;
        const year = yearMonth.substring(0, 4);
        const month = yearMonth.substring(4, 6);
        console.log(`⚠️  ${year}-${month}: Found ${workingDaysByMonth[yearMonth].length} days but not defined in work_days.json`);
    }
});

if (hasErrors) {
    console.log('\n❌ Validation FAILED - Please fix the issues above');
    process.exit(1);
} else {
    console.log('\n✅ All work days are correctly configured');
    process.exit(0);
}
