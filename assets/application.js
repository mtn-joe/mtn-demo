// Put your application javascript here
window.addEventListener('DOMContentLoaded', (e) => {
  if (document.getElementById('sort_by') != null) {
    document.querySelector('#sort_by').addEventListener('change', (e) => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', e.currentTarget.value);

      window.location = url.href;
    });
  }

  if (document.getElementById('AddressCountryNew') != null) {
    document
      .getElementById('AddressCountryNew')
      .addEventListener('change', function (e) {
        const provinces =
          this.options[this.selectedIndex].getAttribute('data-provinces');
        const provinceSelector = document.getElementById('AddressProvinceNew');
        const provinceArray = JSON.parse(provinces);

        // console.log(provinceArray);

        if (provinceArray.length < 1) {
          provinceSelector.setAttribute('disabled', 'disabled');
        } else {
          provinceSelector.removeAttribute('disabled', 'disabled');
        }

        provinceSelector.innerHTML = '';
        let options = '';
        for (let i = 0; i < provinceArray.length; i++) {
          options += `<option value="${provinceArray[i][0]}">${provinceArray[i][0]}</option>`;
        }
        provinceSelector.innerHTML = options;
      });
  }

  if (document.getElementById('forgotPassword')) {
    document.getElementById('forgotPassword').addEventListener('click', (e) => {
      document
        .querySelector('.forgot-password-form')
        .classList.toggle('d-none');
    });
  }

  const localeItem = document.querySelectorAll('#localeItem');
  localeItem.forEach((item) => {
    item.addEventListener('click', (e) => {
      document.querySelector('#localeCode').value = item.getAttribute('lang');
      document.querySelector('#localization_form_tag').submit();
    });
  });

  const productInfoAnchors = document.querySelectorAll('#productInfoAnchor');
  if (
    productInfoAnchors != null &&
    document.querySelector('#productInfoModal') != null
  ) {
    const productModal = new bootstrap.Modal(
      document.querySelector('#productInfoModal'),
      {}
    );
    productInfoAnchors.forEach((item) => {
      item.addEventListener('click', (e) => {
        const product_handle = item.getAttribute('product-handle');
        const url = `/products/${product_handle}.js`;
        fetch(url)
          .then((resp) => resp.json())
          .then((data) => {
            document
              .getElementById('productInfoImage')
              .setAttribute('src', data.images[0]);
            document.getElementById('productInfoTitle').innerHTML = data.title;
            document.getElementById('productInfoPrice').innerHTML =
              item.getAttribute('product-price');
            document.getElementById('productInfoDescription').innerHTML =
              data.description;
            // document.getElementById('modalItemId').value = data.variants[0].id;

            const { variants } = data;
            const variantSelect = document.getElementById('modalItemId');
            variantSelect.innerHTML = '';
            variants.forEach((variant, index) => {
              console.log(variant);
              variantSelect.options[variantSelect.options.length] = new Option(
                variant.option1,
                variant.id
              );
            });

            productModal.show();
          });
      });
    });
  }

  const modalAddToCartForm = document.querySelector('#addToCartForm');
  if (modalAddToCartForm) {
    modalAddToCartForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = {
        items: [
          {
            id: document.getElementById('modalItemId').value,
            quantity: document.getElementById('quantity').value,
          },
        ],
      };

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then((resp) => resp.json())
        .then((data) => update_cart())
        .catch((err) => {
          console.error('Error: ', err);
        });
    });
  }

  const predictiveSearchInput = document.querySelector('#searchInputField');
  let timer;
  const offcanvasSearch = document.querySelector('#offcanvasSearchResult');
  const bsOffCanvas = new bootstrap.Offcanvas(offcanvasSearch);

  if (predictiveSearchInput) {
    predictiveSearchInput.addEventListener('input', (e) => {
      console.log(predictiveSearchInput.value);

      clearTimeout(timer);

      if (predictiveSearchInput.value) {
        timer = setTimeout(() => {
          fetchPredictiveSearch(predictiveSearchInput);
        }, 3000);
      }
    });
  }

  function update_cart() {
    fetch('/cart.js')
      .then((resp) => resp.json())
      .then((data) => {
        // console.log(data);
        document.querySelector('#numberOfCartItems').innerHTML =
          data.item_count;
      })
      .catch((err) => console.error(err));
  }

  function fetchPredictiveSearch(predictiveSearchInput) {
    fetch(
      `/search/suggest.json?q=${predictiveSearchInput.value}&resources[type]=product`
    )
      .then((resp) => resp.json())
      .then((data) => {
        // console.log(data);

        const { products } = data.resources.results;
        let cards = '';
        products.forEach((product, index) => {
          cards += `
          <div class='card'>
            <img src='${product.image}' class='card-image-top'>
            <div class='card-body'>
            <h5 class='card-title'>${product.title}</h5>
            <p class='card-text'>$${product.price}</p>
            </div>
          </div>`;
        });
        document.querySelector('#searchResultsBody').innerHTML = cards;
        bsOffCanvas.show();
      });
  }

  update_cart();
});
