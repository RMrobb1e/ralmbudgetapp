const budgetController = (function () {
  let Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentages = function () {
    return this.percentage;
  };

  let Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, desc, val) {
      let newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item
      if (type === 'exp') {
        newItem = new Expense(ID, desc, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, desc, val);
      }

      // Push to data structure
      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function (type, id) {
      let ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function () {
      calculateTotal('exp');
      calculateTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentage: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      let allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentages();
      });

      return allPerc;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
    testing: function () {
      console.log(data);
    },
  };
})();

const UIController = (function () {
  let DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentage: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };
  const formatNumber = function (num, type) {
    let numSplit, int, decimal;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    decimal = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + decimal;
  };

  const nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    addListItem: function (obj, type) {
      let html, element;

      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
                <div class="item__value">${formatNumber(obj.value, obj.type)}</div>
                <div class="item__delete">
                    <button class="item__delete--btn">
                        <i class="ion-ios-close-outline"></i>
                    </button>
                </div>
            </div>
        </div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expenseContainer;
        html = `<div class="item clearfix" id="exp-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
            <div class="item__value">${formatNumber(obj.value, obj.type)}</div>
            <div class="item__percentage">21%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
            </div>
        </div>`;
      }

      document.querySelector(element).insertAdjacentHTML('beforeend', html);
    },
    deleteListItem: function (selectorID) {
      let element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },
    clearFields: function () {
      let fields, fieldsArr;

      fields = document.querySelectorAll(
        `${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, arr) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },
    displayBudget: function (obj) {
      let type = obj.budget > 0 ? 'inc' : 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(
        obj.totalExp,
        'exp'
      );

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentage).textContent = '---';
      }
    },
    displayPercentages: function (percentages) {
      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function (curr, index) {
        if (percentages[index] > 0) {
          curr.textContent = percentages[index] + '%';
        } else {
          curr.textContent = '---';
        }
      });
    },
    displayMonth: function () {
      let now, year, month, months;
      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },
    changedType: function () {
      let fields;
      fields = document.querySelectorAll(
        `${DOMstrings.inputType}, ${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`
      );
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      });
      document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    },
    getDOMstring: function () {
      return DOMstrings;
    },
  };
})();

const controller = (function (budgetCtrl, UICtrl) {
  let setupEventListeners = function () {
    let DOM = UICtrl.getDOMstring();
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  const updateBudget = function () {
    budgetCtrl.calculateBudget();

    let budget = budgetCtrl.getBudget();

    UICtrl.displayBudget(budget);
  };

  const updatePercentages = function () {
    budgetCtrl.calculatePercentage();

    let percentages = budgetCtrl.getPercentages();

    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = function () {
    let input, newItem;
    input = UICtrl.getInput();
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      UICtrl.addListItem(newItem, input.type);

      UICtrl.clearFields();

      updateBudget();

      updatePercentages();
    }
  };

  const ctrlDeleteItem = function (event) {
    let itemID, splitID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      budgetCtrl.deleteItem(type, ID);

      UICtrl.deleteListItem(itemID);

      updateBudget();

      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log('Application has started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({ budget: 0, totalInc: 0, totalExp: 0, percentage: 0 });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
