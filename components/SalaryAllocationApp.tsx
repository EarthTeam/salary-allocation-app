
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const employees = [
  "Manuel Alonso",
  "Noah Slager",
  "Jamie Skillen",
  "Darius Roffe",
  "Isabella Mattioli",
  "Mina Boozarpour",
  "Manuel Smythe"
];

const defaultRates = {
  "Manuel Alonso": 46.45,
  "Noah Slager": 35.49,
  "Jamie Skillen": 34.70,
  "Darius Roffe": 31.89,
  "Isabella Mattioli": 29.01,
  "Mina Boozarpour": 29.39,
  "Manuel Smythe": 38.42
};

const customers = ["Customer A", "Customer B", "Customer C", "Customer D", "Customer E"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function SalaryAllocationApp() {
  const [data, setData] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("salaryAllocationData");
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      const init = {};
      months.forEach((month) => {
        init[month] = employees.map((employee) => ({
          name: employee,
          rate: defaultRates[employee] || 0,
          allocations: customers.reduce((acc, customer) => {
            acc[customer] = { hours: 0, cumulativeHours: 0, total: 0, cumulativeTotal: 0 };
            return acc;
          }, {})
        }));
      });
      setData(init);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem("salaryAllocationData", JSON.stringify(data));
    }
  }, [data]);

  const handleChange = (month, employeeIdx, customer, field, value) => {
    setData((prev) => {
      const updated = { ...prev };
      const employee = { ...updated[month][employeeIdx] };
      const rate = parseFloat(employee.rate) || 0;
      const entry = customer ? { ...employee.allocations[customer] } : null;

      if (field === "rate") {
        employee.rate = parseFloat(value) || 0;
        Object.keys(employee.allocations).forEach((cust) => {
          const hrs = employee.allocations[cust].hours;
          employee.allocations[cust].total = hrs * employee.rate;
        });
      } else {
        entry[field] = parseFloat(value) || 0;
        if (field === "hours") {
          entry.total = entry.hours * rate;
        }
        employee.allocations[customer] = entry;
      }
      updated[month][employeeIdx] = employee;
      return updated;
    });
  };

  return (
    <Tabs defaultValue="January" className="space-y-4">
      <TabsList>
        {months.map((month) => (
          <TabsTrigger key={month} value={month}>{month}</TabsTrigger>
        ))}
      </TabsList>
      {months.map((month) => (
        <TabsContent key={month} value={month}>
          {data[month]?.map((employee, idx) => (
            <Card key={employee.name} className="mb-4">
              <CardContent className="space-y-2 p-4">
                <div className="font-semibold">{employee.name}</div>
                <div className="flex items-center gap-2">
                  <label>Hourly Rate:</label>
                  <Input
                    type="number"
                    value={employee.rate}
                    onChange={(e) => handleChange(month, idx, null, "rate", e.target.value)}
                    className="w-32"
                  />
                </div>
                {customers.map((customer) => (
                  <div key={customer} className="grid grid-cols-5 gap-2 items-center">
                    <div>{customer}</div>
                    <Input
                      type="number"
                      value={employee.allocations[customer].hours}
                      onChange={(e) => handleChange(month, idx, customer, "hours", e.target.value)}
                      placeholder="Hours"
                    />
                    <Input
                      type="number"
                      value={employee.allocations[customer].total.toFixed(2)}
                      disabled
                      placeholder="Total $"
                    />
                    <Input
                      type="number"
                      value={employee.allocations[customer].cumulativeHours}
                      onChange={(e) => handleChange(month, idx, customer, "cumulativeHours", e.target.value)}
                      placeholder="Cumulative Hrs"
                    />
                    <Input
                      type="number"
                      value={employee.allocations[customer].cumulativeTotal}
                      onChange={(e) => handleChange(month, idx, customer, "cumulativeTotal", e.target.value)}
                      placeholder="Cumulative $"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
