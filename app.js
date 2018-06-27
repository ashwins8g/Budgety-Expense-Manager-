//Data Module
var budgetModule= (function(){
    
    var Income= function(id, description, value){
        this.id= id;
        this.description= description;
        this.value= value;
    };
    
    var Expense= function(id, description, value){
        this.id= id;
        this.description= description;
        this.value= value;
        this.percentage= -1;
    };
    
    Expense.prototype.calcPercentage = function(total_income){
        
        if(total_income > 0){
            this.percentage= Math.round((this.value / total_income) * 100);   
        }else{
            this.percentage = -1;   
        }
        
    };
    
    Expense.prototype.getPercentage = function(){
      return this.percentage;  
    };
    
    var calculateTotal= function(type){
        var sum= 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        
        data.total[type]= sum;
    };
    
    var data= {
        allItems: {exp: [], inc: []},
        total: {exp: 0, inc: 0},
        budget: 0,
        percentage: -1
    };
    
    return{
        addItem: function(type, description, value){
            
            var newItem, ID;
            if(data.allItems[type].length > 0)
                ID= data.allItems[type][data.allItems[type].length - 1].id + 1;     //new ID created for the new item
            else
                ID= 0;
            
                if(type === 'inc')
                    newItem= new Income(ID, description, value);
                    //data.allItems.expenses.push(newItem);
                else if(type === 'exp')
                    newItem= new Income(ID, description, value);
                    //data.allItems.expenses.push(newItem);
            
            data.allItems[type].push(newItem);    //this is a generic way of adding the new item to either of the arrays by using a general type.
            return newItem;
            
        },
        
        deleteItems: function(type, id){
            
            var ids, index;
            ids= data.allItems[type].map(function(current){
               return current.id; 
            });
            
            index= ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            //1. Calculate the sum of expenses and incomes
            
            calculateTotal('exp');
            calculateTotal('inc');
            
            //2. Calculate the budget
            
            data.budget= data.total.inc - data.total.exp;
            
            //3. Calculate the percentage value
            if(data.total.inc > 0)
                data.percentage= Math.round((data.total.exp / data.total.inc) * 100);
            else
                data.percentage = -1;
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.total.inc);
            });
        },
        
        getPercentages: function(cur){
            
            var allPercentages= data.allItems.exp.map(function(){
               return cur.getPercentage();
            });
            
            return allPercentages;
        },
        
        getBudget: function(){
          return{
              budget: data.budget,
              totalIncome: data.total['inc'],
              totalExpenses: data.total.exp,
              percentage: data.percentage
          };
        },
        
        testing: function(){
            console.log(data);
        }
    }
    
})();





//UI Module
var uiModule= (function(){
    
    var domStrings= {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        expensesContainer: '.expenses__list',
        incomeContainer: '.income__list',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        budgetLabel: '.budget__value',
        percentageLabel: '.budget__expenses--percentage',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber= function(num, type){
            
            var numSplit, int, decimal;
            /*
            + or - before number
            2 decimal points
            , separator
            */
            
            num= Math.abs(num);
            num= num.toFixed(2);
            
            numSplit= num.split('.');
            int= numSplit[0];
            decimal= numSplit[1];
            
            if(int.length > 3)
                int= int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, 3);
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +     decimal;
        };
    
    var nodeListForEach= function(list, callback){
              
                for(var i= 0; i< list.length; i++){
                    callback(list[i], i);
                }
                
            };
    
    return{
        getInput: function(){
            return{
                type: document.querySelector(domStrings.inputType).value,           //we get either 'inc' or 'exp'
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            }
        },
        addListItem: function(object, type){
            var html, newHTML, element;
            
            //1. Create HTML string with placeholder
            if(type === 'inc'){
                element = domStrings.incomeContainer;
                html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element= domStrings.expensesContainer;
                html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //2. Replace placeholder text with data
            newHTML= html.replace('%id%', object.id);
            newHTML= newHTML.replace('%description%', object.description);
            newHTML= newHTML.replace('%value%', formatNumber(object.value, type));
            
            //3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        deleteListItem: function(selectorID){
            var el= document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArray;
            
            fields= document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);      /*querySelectorAll() returns a 'nodeList' instead of an array and hence we can't use the methods like .indexOf(), etc on a list and hence to bypass this restriction we use slice() function but not in the conventional way using .operator like we do in arrays eg- fields.slice() won't work, bcz fields does not have an  array, but, a list.*/
            
            fieldsArray= Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current.value= '';
            });
            
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(domStrings.budgetLabel).textContent= formatNumber(obj.budget, type);
            document.querySelector(domStrings.expenseLabel).textContent= formatNumber(obj.totalExpenses, 'exp');
            document.querySelector(domStrings.incomeLabel).textContent= formatNumber(obj.totalIncome, 'inc');
            
            if(obj.percentage > 0)
                document.querySelector(domStrings.percentageLabel).textContent= obj.percentage + '%';
            else
                document.querySelector(domStrings.percentageLabel).textContent= '---';
        },
        displayPercentages: function(percentages){
            
            var fields= document.querySelectorAll(domStrings.expensesPercentageLabel);
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0)
                    current.textContent= percentages[index] + '%';
                else
                    current.textContent= '---';
                
            });
        },
        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            year= now.getFullYear();
            months= ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month= now.getMonth();
            document.querySelector(domStrings.dateLabel).textContent= months[month] + ', ' + year;
        },
        changeType: function(){
            
            var fields= document.querySelectorAll(domStrings.inputType + ',' + domStrings.inputDescription + ',' + domStrings.inputValue);
            
            nodeListForEach(fields, function(cur){
               cur.classList.toggle('red-focus');
            });
            
            document.querySelector(domStrings.inputBtn).classList.toggle('red');
        }
    };
})();





//Controller Module
var controlModule= (function(bdgt, ui){
    
    var setupEventListeners= function(){
        //Key Press Event
        document.querySelector('.add__btn').addEventListener('click', controlModuleAddItem);

        //Return Key press Event
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                controlModuleAddItem();
            }
        });
        
        document.querySelector('.container').addEventListener('click', controlModuleDeleteItem);
        
        document.querySelector('.add__type').addEventListener('change', uiModule.changeType);
    };
    
    var controlModuleAddItem= function(){
        
        var input, newItem;
        
        // 1. Get the input data
        
        input= uiModule.getInput();
        
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
                    
            // 2. Add the data to budget module

            newItem= budgetModule.addItem(input.type, input.description, input.value);

            // 3. Display the data in UI

            uiModule.addListItem(newItem, input.type);

            // 4. Clear the input fields

            uiModule.clearFields();

            //5. Calculate and update the budget

            updateBudget();
            
            //6. Calculate and update percentages
            updatePercentages();
        }
    };
    
    var controlModuleDeleteItem= function(event){
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        var itemID, splitID, type, ID;
        
        itemID= event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID= itemID.split('-');
            type= splitID[0];
            ID= parseInt(splitID[1]);
            
            //1. Delete item from budget module
            budgetModule.deleteItems(type, ID);
            
            //2. Delete item from UI module
            uiModule.deleteListItem(itemID);
            
            //3. Update the budget
            updateBudget();
            
            //4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    var updateBudget= function(){
        
        //1. Calculate the budget
        
        budgetModule.calculateBudget();
        
        //2. Returns the budget
        
        var budget= budgetModule.getBudget();
        
        //3. Update the budget
        
        uiModule.displayBudget(budget);
    };
    
    var updatePercentages= function(){
      
        //1. Calculate percentages
        budgetModule.calculatePercentages();
        
        //2. Read the percentages
        var percentages= budgetModule.getPercentages();
        
        //3. Update the UI
        uiModule.displayPercentages(percentages);
    };
    
    return{
        init: function(){               //Game initialization property
            setupEventListeners();
            uiModule.displayMonth();
            uiModule.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
                })
        }
    }
})(budgetModule, uiModule);






controlModule.init();