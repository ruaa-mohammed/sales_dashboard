{
    "name": "Sales Dashboard",

    "version": "1.0",

    "depends": [
        "web",
        "sale",
    ],

    "assets": {

        "web.assets_backend": [

            "web/static/lib/Chart/Chart.js",
            "sales_dashboard/static/src/dashboard.js",
            "sales_dashboard/static/src/dashboard.xml",
            "sales_dashboard/static/src/dashboard.css",

        ],

    },

    "data": [

        "views/dashboard_view.xml",

    ],

    "installable": True,
}