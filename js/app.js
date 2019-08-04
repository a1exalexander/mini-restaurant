import '../css/style.css';
import food from './food.js';

class FoodShop {

  constructor(food) {
    this.food = food;
    this.totalPrice = 0;
    this.cart = [];
    this.totalAmount = 0;
    this.$elAmount = document.getElementById('amount');
    this.$elPrice = document.getElementById('price');
    this._foodRender(food);
    this._installListeners();
  }

  static formatFood = (data) => {
    return data.map((item) => {
      item.foodAmount = 1;
      item.totalFoodPrice = item.price;
      return item;
    })
  }

  _getCardFood = (food) => {
    return (
      `<div data-food-id='${food.id}' class="card food-card">
      <header class="card-header">
          <p class="card-header-title">
            ${food.name}
          </p>
          <div class='card-header-icon'>
              <i class="fas fa-money-bill-alt"></i>
            <span class='is-size-6 has-text-weight-bold price'>${food.price}</span>
          </div>
        </header>
      <div class="card-image">
          <figure class="image is-4by3">
            <img src="${food.image}" alt="Placeholder image">
          </figure>
        </div>
      <footer class="card-footer">
        <div>
            <i class="fas fa-sort-numeric-up-alt"></i>
            <input data-food-amount='${food.id}' min='1' value='${food.foodAmount}' data-food class="input food-card__input is-small" type="number" placeholder="Кол-во">
            <span data-total-price='${food.id}' class="tag is-black">${food.totalFoodPrice} грн</span>
        </div>
        <button data-add-button='${food.id}' class="button is-info is-small">Добавить</buttona>
      </footer>
    </div>`
    )
  }

  _getNotificationText = (sum) => {
    return `Заказ на сумму ${sum} грн принят`;
  }

  _getOrders = (data) => {
    const result = data.map((item) => {
      return (`<li class='order__item is-size-6'
        >${item.name} (${item.foodAmount} порц., ${item.totalFoodPrice} грн)
      </li>`);
    });
    return result.join('');
  }

  renderTemplate = (boxId, template) => {
    const HTML = document.getElementById(boxId);
    HTML.innerHTML = template;
  }

  _foodRender = (arr) => {
    const template = arr.map(this._getCardFood);
    this.renderTemplate('food', template.join(''));
    this._installFoodAmountListener();
    this._installAddFoodListener();
  }

  _compileTemplate = (arr) => {
    return arr.join('');
  }

  _filteredByType = (food) => {
    const $el = document.getElementById('food-type');
    return food.filter(({ type }) => type === $el.value || $el.value === 'all');
  }

  _filteredByPrice = (food) => {
    const $el = document.getElementById('food-price');
    return food.filter(({ price }) => price <= $el.value || $el.value === 'all');
  }

  _filteredFood = () => {
    return this._filteredByPrice(this._filteredByType(this.food));
  }

  _installFiltersListener = () => {
    document.getElementById('food-type').addEventListener('change', () => {
      this._foodRender(this._filteredFood());
    });
    document.getElementById('food-price').addEventListener('change', () => {
      this._foodRender(this._filteredFood());
    });
    
  }

  _installFoodAmountListener = () => {
    document.querySelectorAll('[data-food-amount]').forEach((el) => {
      if (!el.classList.contains('click-handler')) {
        el.classList.add('click-handler');
        el.addEventListener('input', () => {
          const foodId = el.dataset.foodAmount;
          const idx = this.food.findIndex(({id}) => Number(id) === Number(foodId));
          const { price } = this.food[idx];
          const totalFoodPrice = Number(el.value) * Number(price);
          const updatedFood = Object.assign({}, this.food[idx], {foodAmount: Number(el.value), totalFoodPrice });
          this.food.splice(idx, 1, updatedFood);
          document.querySelector(`[data-total-price="${foodId}"]`).innerHTML = `${totalFoodPrice} грн`;
        })
      }
    })
  }

  _installAddFoodListener = () => {
    document.querySelectorAll('[data-add-button]').forEach((el) => {
      if (!el.classList.contains('click-handler')) {
        el.classList.add('click-handler');
        el.addEventListener('click', () => {
          const foodId = el.dataset.addButton;
          const idx = this.food.findIndex(({id}) => Number(id) === Number(foodId));
          const { foodAmount, totalFoodPrice } = this.food[idx];
          
          this.totalPrice += Number(totalFoodPrice);
          this.totalAmount += Number(foodAmount);

          this.$elAmount.innerHTML = this.totalAmount;
          this.$elPrice.innerHTML = `${this.totalPrice} грн`;

          this._addFoodToCart(this.food[idx]);
        })
      }
    })
  }

  _installModalListeners = () => {
    const $button = document.getElementById('make-order');
    const $modal = document.getElementById('order-modal');
    const $close = document.getElementById('close-modal');
    const $closeBg = document.getElementById('close-modal-bg');
    const $closeNotification = document.getElementById('close-notification');
    const $notification = document.getElementById('notification');
    const $warning = document.getElementById('notification-warning');
    const $closeWarning = document.getElementById('close-warning');
    $button.addEventListener('click', () => {
      if (this.cart.length) {
        this.renderTemplate('order', this._getOrders(this.cart));
        $modal.style.display = 'block';
      } else {
        $warning.style.display = 'none';
        setTimeout(() => {
          $warning.style.display = 'block';
          const timer = setTimeout(() => {
            $warning.style.display = 'none';
            clearTimeout(timer);
          }, 3000);
        }, 50);
      }
    });
    $close.addEventListener('click', () => {
      $modal.style.display = 'none';
    });
    $closeWarning.addEventListener('click', () => {
      $warning.style.display = 'none';
    });
    $closeBg.addEventListener('click', () => {
      $modal.style.display = 'none';
    });
    $closeNotification.addEventListener('click', () => {
      $notification.style.display = 'none';
    });
  }

  _checkEmail = (email) => {
    const re = /^(([^<>+()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;
    return re.test(email);
  }

  _checkName = (value) => {
    const re = /\d+/g;
    const re2 = /^\S+\S/g;
    return !re.test(value) && re2.test(value);
  }

  _isButtonDisabled = (email, name) => {
    return !(this._checkEmail(email) && this._checkName(name));
  }

  _clearState = () => {
    this.cart = [];
    this.totalAmount = 0;
    this.totalPrice = 0;
    this.$elAmount.innerHTML = 0;
    this.$elPrice.innerHTML = `0 грн`;
  }

  _installFormListeners = () => {
    const $modal = document.getElementById('order-modal');
    const $sendButton = document.getElementById('send-order');
    const $name = document.getElementById('user-name');
    const $email = document.getElementById('user-email');
    const $emailChecked = document.getElementById('email-checked');
    const $notification = document.getElementById('notification');
    const $notificationText = document.getElementById('notification-text');
    $name.addEventListener('input', () => {
      $sendButton.disabled = this._isButtonDisabled($email.value, $name.value);
    });
    $email.addEventListener('input', () => {
      if (this._checkEmail($email.value)) {
        $emailChecked.classList.add('has-text-success');
      } else {
        $emailChecked.classList.remove('has-text-success');
      }
      $sendButton.disabled = this._isButtonDisabled($email.value, $name.value);
    });
    $sendButton.addEventListener('click', () => {
      $modal.style.display = 'none';
      $notificationText.innerText = this._getNotificationText(this.totalPrice);
      setTimeout(() => {
        $notification.style.display = 'block';
        this._clearState();
        const timer = setTimeout(() => {
          $notification.style.display = 'none';
          clearTimeout(timer);
        }, 4000);
      }, 500);
    });
    
  }

  _addFoodToCart = (newFoodData) => {
    const foodId = newFoodData.id;
    if (this.cart.some(({id}) => id === foodId)) {
      const idx = this.cart.findIndex(({id}) => id === foodId);
      const foodFromCart = this.cart[idx];
      foodFromCart.foodAmount += newFoodData.foodAmount;
      foodFromCart.totalFoodPrice += newFoodData.totalFoodPrice;
      this.cart.splice(idx, 1, foodFromCart);
    } else {
      this.cart.push(newFoodData);
    }
  }

  _installListeners = () => {
    this._installFiltersListener();
    this._installFoodAmountListener();
    this._installAddFoodListener();
    this._installModalListeners();
    this._installFormListeners();
  }
}

window.addEventListener('DOMContentLoaded', async () => {

  new FoodShop(FoodShop.formatFood(food));
});