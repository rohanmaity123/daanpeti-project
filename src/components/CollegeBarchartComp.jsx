// BarChartComponent.jsx
import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    Legend,
} from 'recharts';

// const data = [
//     { stage: 'Open', count: 300 },
//     { stage: 'Case stage 122', count: 50 },
//     { stage: 'Case stage 11', count: 10 },
//     { stage: 'Close', count: 30 },
//     { stage: 'Post Conviction', count: 8 },
// ];

const colors = ['#4A90E2', '#50E3C2', '#9013FE', '#2D9CDB', '#9B51E0'];

const CollegeBarChartComponent = ({ data = [], setStartDate, setEndDate }) => {
    console.log('chart', data);
    const [caseFilter, setCaseFilter] = useState('my');

    useEffect(() => {
        if (caseFilter === 'sixmonth') {
            // Set date range for last 6 months
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 6);
            setStartDate(start);
            setEndDate(end);
        } else if (caseFilter === 'thisMonth') {
            // Set date range for current month
            const end = new Date();
            const start = new Date();
            start.setDate(1);
            setStartDate(start);
            setEndDate(end);
        } else if (caseFilter === 'oneYear') {
            // Set date range for last 1 year
            const end = new Date();
            const start = new Date();
            start.setFullYear(start.getFullYear() - 1);
            setStartDate(start);
            setEndDate(end);
        }
    }, [caseFilter]);

    const handleFilterChange = (filter) => {
        setCaseFilter(filter);
        // Optionally refetch or filter data based on 'my' or 'all'
    };

    return (
        <>

            <div className="layout-chart-white-card-box loader-center">
                <div className="w-100">
                    <div className="rg-filters">
                        <ul>
                            <li>
                                <button
                                    className={`${caseFilter === 'sixmonth' ? 'active' : ''
                                        }`}
                                    onClick={() => handleFilterChange('sixmonth')}
                                >
                                    6 Months
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`${caseFilter === 'thisMonth' ? 'active' : ''
                                        }`}
                                    onClick={() => handleFilterChange('thisMonth')}
                                >
                                    This Month
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`${caseFilter === 'oneYear' ? 'active' : ''
                                        }`}
                                    onClick={() => handleFilterChange('oneYear')}
                                >
                                    One Year
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="chart-y-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                {/* Left Y-axis for Paid Fees */}
                                <YAxis yAxisId="left" />

                                {/* Right Y-axis for Admission Count */}
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                {/* Paid Fees on Left Axis */}
                                <Bar
                                    yAxisId="left"
                                    dataKey="total_fees"
                                    name="Total Fees"
                                    fill="#4A90E2"
                                />

                                {/* Admission Count on Right Axis */}
                                <Bar
                                    yAxisId="right"
                                    dataKey="total"
                                    name="Admission Count"
                                    fill="#50E3C2"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </>
    );
};

export default CollegeBarChartComponent;
