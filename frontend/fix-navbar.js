const fs = require('fs');
const f_path = 'src/app/user/navbar/navbar.component.ts';
let f = fs.readFileSync(f_path, 'utf8');
if (!f.includes('inject(ChangeDetectorRef)')) {
  f = f.replace('companyEmployeeService=inject(CompanyEmployeeService);', 
    'companyEmployeeService=inject(CompanyEmployeeService);\n  private cdr=inject(ChangeDetectorRef);');
  fs.writeFileSync(f_path, f);
  console.log('done');
} else {
  console.log('already present');
}
