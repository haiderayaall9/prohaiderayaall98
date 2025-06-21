document.addEventListener('DOMContentLoaded', function () {
  // بيانات الأكلات (مؤقتة، استبدلها ببيانات ديناميكية أو من localStorage)
 // ✅ جلب البيانات من قاعدة البيانات
let foods = [];

fetch('fetch_food.php')
  .then(response => response.json())
  .then(data => {
    if (Array.isArray(data)) {
      foods = data;
      renderFoodList();  // استدعِ الوظيفة بعد جلب البيانات
    } else {
      console.error("فشل في جلب الأكلات:", data);
    }
  })
  .catch(error => {
    console.error("خطأ في الاتصال بـ PHP:", error);
  });

  // سلة المشتريات: مصفوفة العناصر المختارة
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // عناصر واجهة المستخدم
  const foodList = document.getElementById('food-list');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalElem = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');

  const deliveryMethodRadios = document.getElementsByName('deliveryMethod');
  const provinceSelect = document.getElementById('province');
  const districtSelect = document.getElementById('district');
  const subDistrictSelect = document.getElementById('subDistrict');
  const deliveryPriceSpan = document.getElementById('deliveryPrice');

  const locationInput = document.getElementById('location');
  const locationOptionsDiv = document.getElementById('locationOptions');
  const customLocationInput = document.getElementById('customLocationInput');

  // بيانات المحافظات والأقضية والنواحي مع أسعار التوصيل
  const provincesData = {
    "بغداد": {
      "القصبات": { "الكرادة": 2000, "النهروان": 2500 },
      "الرحمانية": { "الرحمانية": 1800 }
    },
    "البصرة": {
      "المحمرة": { "المحمرة": 2200, "القرنة": 2300 },
      "الفاو": { "الفاو": 2700 }
    },
    "نينوى": {
      "الموصل": { "الجانب الأيسر": 2100, "الجانب الأيمن": 2100 },
      "تلعفر": { "تلعفر": 2400 }
    },
    // أكمل باقي المحافظات...
  };

  // تحديث عداد السلة
  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
      cartCount.style.display = 'inline-block';
      cartCount.textContent = totalItems;
    } else {
      cartCount.style.display = 'none';
    }
  }

  // حفظ السلة في localStorage
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }

  // إنشاء قائمة الأطعمة في الواجهة
  function renderFoodList() {
    foodList.innerHTML = '';
    foods.forEach(food => {
      const firstWord = food.name.trim().split(' ')[0].toLowerCase();

      const item = document.createElement('div');
      item.className = `col-sm-6 col-lg-4 all ${firstWord}`;

      item.innerHTML = `
        <div class="box">
          <div>
            <div class="img-box">
              <img src="${food.image}" alt="">
            </div>
            <div class="detail-box">
              <h5>${food.name}</h5>
              <p>${food.description}</p>
              <div class="options">
                <h6>${food.price}$</h6>
                <div class="quantity-control">
                  <button class="qty-decrease" title="نقص الكمية">-</button>
                  <span class="qty-number">1</span>
                  <button class="qty-increase" title="زيادة الكمية">+</button>
                </div>
                <a href="#" title="إضافة للسلة"><i class="fa fa-shopping-cart"></i></a>
              </div>
            </div>
          </div>
        </div>
      `;

      foodList.appendChild(item);
    });
  }

  // تحديث واجهة السلة داخل المودال مع زر حذف
  function renderCart() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>السلة فارغة</p>';
      cartTotalElem.textContent = '0.00';
      return;
    }

    let total = 0;

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';

      itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-quantity">
            <button class="qty-decrease" data-index="${index}">-</button>
            <span>${item.quantity}</span>
            <button class="qty-increase" data-index="${index}">+</button>
          </div>
        </div>
        <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
        <button class="btn btn-danger btn-sm cart-item-remove" data-index="${index}" title="حذف الصنف">✖ حذف</button>
      `;

      cartItemsContainer.appendChild(itemDiv);
    });

    // أضف سعر التوصيل فقط لو كانت طريقة التوصيل "delivery"
    const selectedMethod = Array.from(deliveryMethodRadios).find(r => r.checked)?.value;
    let deliveryPrice = 0;

    if (selectedMethod === 'delivery') {
      deliveryPrice = parseInt(deliveryPriceSpan.textContent) || 0;
    } else {
      deliveryPriceSpan.textContent = '0'; // تأكد أن السعر صفر لو استلام ذاتي
    }

    const grandTotal = total + deliveryPrice;
    cartTotalElem.textContent = grandTotal.toFixed(2);
  }

  // ضبط أزرار زيادة ونقص الكمية في قائمة الطعام
  foodList.addEventListener('click', function (e) {
    if (e.target.classList.contains('qty-increase')) {
      const qtyNumber = e.target.parentElement.querySelector('.qty-number');
      let qty = parseInt(qtyNumber.textContent);
      qty++;
      qtyNumber.textContent = qty;
    }
    if (e.target.classList.contains('qty-decrease')) {
      const qtyNumber = e.target.parentElement.querySelector('.qty-number');
      let qty = parseInt(qtyNumber.textContent);
      if (qty > 1) {
        qty--;
        qtyNumber.textContent = qty;
      }
    }
  });

  // إضافة/حذف صنف من السلة عند الضغط على أيقونة السلة
  foodList.addEventListener('click', function (e) {
    if (e.target.closest('.options a')) {
      e.preventDefault();
      const cartIcon = e.target.closest('.options a');

      const box = cartIcon.closest('.box');
      const foodName = box.querySelector('h5').textContent;
      const foodPriceText = box.querySelector('h6').textContent;
      const foodPrice = parseFloat(foodPriceText.replace('$', ''));
      const foodImage = box.querySelector('.img-box img').src;
      const qtyNumber = box.querySelector('.qty-number').textContent;
      const quantity = parseInt(qtyNumber);

      const itemIndex = cart.findIndex(item => item.name === foodName);

      if (itemIndex > -1) {
        // إزالة من السلة
        cart.splice(itemIndex, 1);
        cartIcon.classList.remove('selected');
      } else {
        // إضافة للسلة
        cart.push({ name: foodName, price: foodPrice, image: foodImage, quantity });
        cartIcon.classList.add('selected');
      }

      saveCart();
    }
  });

  // تعديل الكمية داخل مودال السلة وزر الحذف
  cartItemsContainer.addEventListener('click', function (e) {
    const target = e.target;
    if (target.classList.contains('qty-increase') || target.classList.contains('qty-decrease')) {
      const index = parseInt(target.getAttribute('data-index'));
      if (isNaN(index)) return;

      if (target.classList.contains('qty-increase')) {
        cart[index].quantity++;
      } else {
        if (cart[index].quantity > 1) {
          cart[index].quantity--;
        }
      }

      saveCart();
      renderCart();
    } else if (target.classList.contains('cart-item-remove')) {
      // زر حذف الصنف
      const index = parseInt(target.getAttribute('data-index'));
      if (isNaN(index)) return;

      cart.splice(index, 1);
      saveCart();
      renderCart();
    }
  });

  // فتح المودال -> عرض السلة
  $('#cartModal').on('show.bs.modal', function () {
    renderCart();
  });

  // التبديل بين حقول الاستلام والتوصيل
  function toggleDeliveryFields() {
    const selectedMethod = Array.from(deliveryMethodRadios).find(r => r.checked)?.value;

    const provinceGroup = provinceSelect.closest('.form-group');
    const districtGroup = districtSelect.closest('.form-group');
    const subDistrictGroup = subDistrictSelect.closest('.form-group');
    const locationGroup = locationInput.closest('.form-group');
    const deliveryPriceGroup = deliveryPriceSpan.closest('.form-group');

    if (selectedMethod === 'pickup') {
      // إخفاء حقول التوصيل
      provinceGroup.style.display = 'none';
      districtGroup.style.display = 'none';
      subDistrictGroup.style.display = 'none';
      locationGroup.style.display = 'none';
      deliveryPriceGroup.style.display = 'none';

      // إعادة تعيين سعر التوصيل إلى صفر
      deliveryPriceSpan.textContent = '0';
    } else if (selectedMethod === 'delivery') {
      // إظهار حقول التوصيل
      provinceGroup.style.display = '';
      districtGroup.style.display = '';
      subDistrictGroup.style.display = '';
      locationGroup.style.display = '';
      deliveryPriceGroup.style.display = '';
    }

    renderCart();
  }

  deliveryMethodRadios.forEach(radio => {
    radio.addEventListener('change', toggleDeliveryFields);
  });

  // معالجة اختيار المحافظة - تحديث الأقضية
  provinceSelect.addEventListener('change', function () {
    const province = this.value;
    districtSelect.innerHTML = '';
    subDistrictSelect.innerHTML = '';
    deliveryPriceSpan.textContent = '0';
    renderCart();

    if (!province || !provincesData[province]) {
      districtSelect.disabled = true;
      subDistrictSelect.disabled = true;
      return;
    }

    const districts = Object.keys(provincesData[province]);
    districtSelect.disabled = false;
    districtSelect.innerHTML = '<option value="">اختر القضاء</option>';
    districts.forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });

    subDistrictSelect.disabled = true;
  });

  // اختيار القضاء - تحديث النواحي
  districtSelect.addEventListener('change', function () {
    const province = provinceSelect.value;
    const district = this.value;
    subDistrictSelect.innerHTML = '';
    deliveryPriceSpan.textContent = '0';
    renderCart();

    if (!district || !provincesData[province][district]) {
      subDistrictSelect.disabled = true;
      return;
    }

    const subDistricts = Object.keys(provincesData[province][district]);
    subDistrictSelect.disabled = false;
    subDistrictSelect.innerHTML = '<option value="">اختر الناحية</option>';
    subDistricts.forEach(sub => {
      const option = document.createElement('option');
      option.value = sub;
      option.textContent = sub;
      subDistrictSelect.appendChild(option);
    });
  });

  // اختيار الناحية - تحديث سعر التوصيل
  subDistrictSelect.addEventListener('change', function () {
    const province = provinceSelect.value;
    const district = districtSelect.value;
    const subDistrict = this.value;

    if (!subDistrict) {
      deliveryPriceSpan.textContent = '0';
      renderCart();
      return;
    }

    const deliveryPrice = provincesData[province][district][subDistrict] || 0;
    deliveryPriceSpan.textContent = deliveryPrice;

    renderCart();
  });

  // حقل الموقع مع الخيارات
  function showLocationOptions() {
    locationOptionsDiv.style.display = 'block';
    locationInput.readOnly = true;
  }

  function setLocationType(type) {
    customLocationInput.value = '';
    if (type === 'landmark') {
      customLocationInput.placeholder = "اكتب أقرب نقطة دالة أو اسم منطقتك (مثال: مطعم، ساحة)";
    } else {
      customLocationInput.placeholder = "ألصق رابط موقعك من خرائط واتساب أو Google Maps";
    }
    updateLocationField();
  }

  function updateLocationField() {
    locationInput.value = customLocationInput.value;
  }

  // حدث الضغط على حقل الموقع لعرض الخيارات
  if (locationInput) {
    locationInput.addEventListener('click', showLocationOptions);
  }

  // زر إرسال الطلب عبر واتساب
  document.getElementById('sendOrderBtn').addEventListener('click', function () {
    if (cart.length === 0) {
      alert('السلة فارغة، يرجى إضافة عناصر قبل الإرسال.');
      return;
    }

    const fullName = document.getElementById('fullName').value || 'غير مذكور';
    const phone = document.getElementById('phone').value || 'غير مذكور';
    const province = provinceSelect.value || 'غير مذكورة';
    const district = districtSelect.value || 'غير مذكور';
    const subDistrict = subDistrictSelect.value || 'غير مذكورة';
    const location = locationInput.value || 'غير مذكور';

    const selectedMethod = Array.from(deliveryMethodRadios).find(r => r.checked)?.value || 'pickup';

    let itemsText = cart.map(item => `- ${item.name} (الكمية: ${item.quantity}): $${(item.price * item.quantity).toFixed(2)}`).join('\n');

    const totalPrice = cartTotalElem.textContent || '0.00';

    let message = `طلب جديد:
- الاسم: ${fullName}
- رقم الهاتف: ${phone}
- طريقة الاستلام: ${selectedMethod === 'pickup' ? 'استلام ذاتي' : 'خدمات التوصيل'}`;

    if (selectedMethod === 'delivery') {
      message += `
- المحافظة: ${province}
- القضاء: ${district}
- الناحية: ${subDistrict}
- الموقع: ${location}`;
    }

    message += `
- الأكلات:
${itemsText}
- المجموع الكلي: $${totalPrice}`;

    const recipientNumber = '9647701234567'; // عدل رقم واتساب هنا
    const whatsappLink = `https://wa.me/${recipientNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  });

  // بدء العمل
    // بدء العمل
  renderFoodList();
  updateCartCount();
  toggleDeliveryFields();
});

