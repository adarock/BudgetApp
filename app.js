// Budget Controller
var budgetController = (function() {
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },

        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;


            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            if(type === "inc") {
                newItem = new Income(ID, des, val);
            }
            else if(type === "exp") {
                newItem = new Expense(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we have already spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }


        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
                // TODO: Confirm we need to pass budget
            });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing:  function() {
            console.log(data);
        }
    };


})();

// UI Controller
var UIController = (function() {

    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: "item__percentage",
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };


    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, element;

            // Create HTML string with placeholder text
            if(type === "inc") {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === "exp") {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with real inputData
            html = html.replace("%id%", obj.id);
            html = html.replace("%description%", obj.description);
            html = html.replace("%value%", formatNumber(obj.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", html);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = "inc" : "exp";

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.getElementsByClassName(DOMstrings.expensesPercLabel);

            var nodeListForEach = function(list, callback) {
                for (i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayDate: function() {
            var now = new Date();

            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            document.querySelector(DOMstrings.dateLabel).textContent = months[now.getMonth()] + " " + now.getFullYear();

        },

        changedType: function() {

            var fields = document.getElementsByClassName(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            console.log(fields);

            var nodeListForEach = function(list, callback) {
                for (i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        clearFields : function() {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        getDOMstrings : function() {
            return DOMstrings;
        }
    };

})();

// Main Controller
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UIController.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

    };

    var updateBudget = function() {
        // Calculate the budget
        budgetCtrl.calculateBudget();

        // Return the budget
        var budget = budgetController.getBudget();

        // Display the budget on the UI
        UIController.displayBudget(budget);
    };

    var updatePercentages = function() {
        // Calculate updatePercentages
        budgetCtrl.calculatePercentages();

        // Read from budget Controller
        var percentages = budgetCtrl.getPercentages();

        // Update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var inputData, newItem;

        // Get input data
        inputData = UIController.getInput();

        if(inputData.description !== "" && !isNaN(inputData.value) && inputData.value > 0) {
            // Add item to budgetController
            newItem = budgetController.addItem(inputData.type, inputData.description, inputData.value);


            // Add new item to the UI
            UIController.addListItem(newItem, inputData.type);
            UIController.clearFields();

            // Calculate and update the budget
            updateBudget();

            // Update Percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event) {
        var itemID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            type = itemID.split("-")[0];
            ID = parseInt(itemID.split("-")[1]);
        }

        // Remove item from budgetController
        budgetCtrl.deleteItem(type, ID);

        // Remove item from the UI
        UICtrl.deleteListItem(itemID);

        // Calculate and update the budget
        updateBudget();

        // Update Percentages
        updatePercentages();
    };

    return {
        init: function() {
            console.log("App has started");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
            UICtrl.displayDate();
        }
    };

})(budgetController, UIController);



controller.init();
