var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };
    
    var Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum = sum + current.value;
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
         addNewItem : function(type, des, val) {

            var newItem, id;
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }
            
            if (type === 'inc') {
                newItem = new Income(id, des, val);
            } else if (type === 'exp') {
                newItem = new Expense(id, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, ID){
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(ID);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },

        calculateBudget: function() {

            //calculate total income and expences
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate the budget income - expences
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of the income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        getBudget: function() {
            return {
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        },

        initBudget: function() {
            return {
                totalInc: 0,
                totalExp: 0,
                budget: 0,
                percentage: -1
            }
        },
        
        testing: function() {
          console.log(data);  
        }
    }
    
   
    
    
})();



var UIController = (function() {
    
     var DOMStrings = {
        addType: '.add__type',
        addDescription: '.add__description',
        addValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        incLable: '.budget__income--value',
        expLabel: '.budget__expenses--value',
        budgetLabel: '.budget__value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
         
    };
    
    return {
        getInput: function() {
            return {
                addType: document.querySelector(DOMStrings.addType).value,
                addDescription: document.querySelector(DOMStrings.addDescription).value,
                addValue: parseFloat(document.querySelector(DOMStrings.addValue).value)
            };
            
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //Create HTML string with placeholder text
            
            if (type === 'inc'){
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right          clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i                   class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right         clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button        class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //replce the placeholder text with the actual value
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            //insert the HTML into the DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            //(obj.description !== '' || obj.value !== '') ? document.querySelector(element).insertAdjacentHTML('beforeend', newHtml) : document.querySelector(element).innerHTML(''); //need to be removed
                        
        },
        
        deleteListItem: function(id) {
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        updateBudget: function(obj) {
            document.querySelector(DOMStrings.incLable).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expLabel).textContent = obj.totalExp;
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        
        //temporary added function, need to be removed
        
        resetFields: function() {
            document.querySelector(DOMStrings.addDescription).value = '';
            document.querySelector(DOMStrings.addValue).value = '';
            document.querySelector(DOMStrings.addDescription).focus();
        },
        /////////////////////////////////
        
        getInputString: function() {
            return DOMStrings;
        }
    };
    
})();


var controller = (function(budgetctrl, UICtrl) {
    
    var setUpEventListeners = function() {
        var DOM = UICtrl.getInputString();
        
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            } 
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetctrl.calculateBudget();

        // 2.return the budget
        var budget = budgetctrl.getBudget();

        // 3. Display the budget tothe UI
        UICtrl.updateBudget(budget);
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        
        input = UICtrl.getInput();  
        
        // 2. Add the item to the budget controller
        if(input.addDescription !== '' && !isNaN(input.addValue) && input.addValue > 0) {

            newItem = budgetctrl.addNewItem(input.addType, input.addDescription, input.addValue);
        
            // 3. Add the item to the UI
            
            UICtrl.addListItem(newItem, input.addType);
            
            //temporary added code(need to be removed)
            
            UICtrl.resetFields();
            
            ///////////////////////////////
            
            updateBudget();
        }
                
    };

    var ctrlDeleteItem = function(event) {
        var itemId, splitId, ID, type;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId) {
            
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //delete data from the data structure 
            budgetctrl.deleteItem(type, ID);
            
            //delete item from the UI
            UICtrl.deleteListItem(itemId);
            
            //Update and show the new budget
            updateBudget();
            
        }
        
        
    };
        
    return {
        init: function() {
            console.log('The application has started.');
            var initializeBudget = budgetctrl.initBudget();
            UICtrl.updateBudget(initializeBudget);
            setUpEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();



//























