/** @odoo-module **/

import { Component, onWillStart, onMounted, useState, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";


export class SalesDashboard extends Component {

    setup() {

        this.orm = useService("orm");
        this.action = useService("action");
        this.notification = useService("notification");

        this.chartRef = useRef("salesChart");


        this.chart = null;

        this.state = useState({

            loading: true,

            error: null,

            kpis: {

                totalSales: 0,

                totalOrders: 0,

                totalCustomers: 0,

                averageOrder: 0,

            },

            latestOrders: [],

            monthlySales: [],

        });


        onWillStart(async () => {

            await this.loadDashboard();

        });

        onMounted(() => {

            this.renderChart();

        });

    }


    

// Load dashboard 

    async loadDashboard() {

    this.state.loading = true;

    this.state.error = null;

    try {

        console.log("KPIs...");
await this.loadKPIs();

console.log("Orders...");
await this.loadLatestOrders();

console.log("Monthly...");
await this.loadMonthlySales();

console.log("Done");
    } catch (error) {
         console.error("Dashboard Error:", error);
 
        this.state.error = error;
 
        this.notification.add(
            "Failed to load dashboard",
            {
                type: "danger",
            }
        );
 
    } finally {
 
        this.state.loading = false;
 
    }
 
}

// Load KPIs

async loadKPIs() {

 const sales = await this.orm.call(
    "sale.order",
    "read_group",
    [
        [["state", "=", "sale"]],
        ["amount_total:sum"],
        [],
    ]
);

    const orders = await this.orm.searchCount(
        "sale.order",
        [["state", "=", "sale"]]
    );

    const customers = await this.orm.searchCount(
        "res.partner",
        [["customer_rank", ">", 0]]
    );

    this.state.kpis.totalSales =
        sales.length ? sales[0].amount_total : 0;

    this.state.kpis.totalOrders = orders;

    this.state.kpis.totalCustomers = customers;

    this.state.kpis.averageOrder =
        orders
            ? this.state.kpis.totalSales / orders
            : 0;

}


// Load last 10 orders


async loadLatestOrders() {

    this.state.latestOrders = await this.orm.searchRead(

        "sale.order",

        [["state", "=", "sale"]],

        [
            "name",
            "partner_id",
            "amount_total",
            "date_order",
        ],

        {
            order: "date_order desc",
            limit: 10,
        }

    );

}


// Load monthly sales data

async loadMonthlySales() {
const result = await this.orm.call(
    "sale.order",
    "read_group",
    [
        [["state", "=", "sale"]],
        ["amount_total:sum"],
        ["date_order:month"],
    ]
);

    this.state.monthlySales = result;

}




// Load render chart

renderChart() {

    if (!this.chartRef.el) {

        return;

    }

    const labels = this.state.monthlySales.map(

        item => item["date_order:month"]

    );

    const values = this.state.monthlySales.map(

        item => item.amount_total_sum

    );

    if (this.chart) {

        this.chart.destroy();

    }

    this.chart = new Chart(

        this.chartRef.el,

        {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {

                        label: "Monthly Sales",

                        data: values,

                        borderWidth: 1,

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

            }

        }

    );

}




async openView(model, domain, title) {

    await this.action.doAction({

        type: "ir.actions.act_window",

        name: title,

        res_model: model,

        views: [

            [false, "list"],
            [false, "form"]

        ],

        domain,

    });

}

}


SalesDashboard.template =
"sales_dashboard.Dashboard";


registry.category("actions").add(
    "sales_dashboard",
    SalesDashboard
);