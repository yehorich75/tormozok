class HystModal {
  /**
   * При создании экземпляра класса, мы передаём в него
   * js-объект с настройками. Он становится доступен
   * в конструкторе класса в виде переменной props
   */
  constructor(props) {
    /**
     * Для удобства некоторые свойства можно не передавать
     * Мы должны заполнить их начальными значениями
     * Это можно сделать применив метод Object.assign
     */
    let defaultConfig = {
      linkAttributeName: 'data-hystmodal',
      // ... здесь остальные свойства
    };
    this.config = Object.assign(defaultConfig, props);

    // сразу вызываем метод инициализации
    this.init();
  }

  /**
   * В свойство _shadow будет заложен div с визуальной
   * подложкой. Оно сделано статическим, т.к. при создании
   * нескольких экземпляров класса, эта подложка нужна только
   * одна
   */
  static _shadow = false;

  init() {
    /**
     * Создаём триггеры состояния, полезные переменные и.т.д.
     */
    this.isOpened = false; // открыто ли окно
    this.openedWindow = false; //ссылка на открытый .hystmodal
    this._modalBlock = false; //ссылка на открытый .hystmodal__window
    (this.starter = false), //ссылка на элемент "открыватель" текущего окна
      // (он нужен для возвращения фокуса на него)
      (this._nextWindows = false); //ссылка на .hystmodal который нужно открыть
    this._scrollPosition = 0; //текущая прокрутка (см. выше)

    /**
     * ... остальное
     */

    // Создаём только одну подложку и вставляем её в конец body
    if (!HystModal._shadow) {
      HystModal._shadow = document.createElement('div');
      HystModal._shadow.classList.add('hystmodal__shadow');
      document.body.appendChild(HystModal._shadow);
    }

    //Запускаем метод для обработки событий см. ниже.
    this.eventsFeeler();
  }

  eventsFeeler() {
    /**
     * Нужно обработать открытие окон по клику на элементы с data-атрибутом
     * который мы установили в конфигурации - this.config.linkAttributeName
     *
     * Здесь мы используем делегирование события клика, чтобы обойтись одним
     * лишь обработчиком события на элементе html
     *
     */
    document.addEventListener(
      'click',
      function (e) {
        /**
         * Определяем попал ли клик на элемент,
         * который открывает окно
         */
        const clickedlink = e.target.closest(
          '[' + this.config.linkAttributeName + ']'
        );

        /** Если действительно клик был на
         * элементе открытия окна, находим
         * подходящее окно, заполняем свойства
         *  _nextWindows и _starter и вызываем
         *  метод open (см. ниже)
         */
        if (clickedlink) {
          e.preventDefault();
          this.starter = clickedlink;
          let targetSelector = this.starter.getAttribute(
            this.config.linkAttributeName
          );
          this._nextWindows = document.querySelector(targetSelector);
          this.open();
          return;
        }

        /** Если событие вызвано на элементе
         *  с data-атрибутом data-hystclose,
         *  значит вызовем метод закрытия окна
         */
        if (e.target.closest('[data-hystclose]')) {
          this.close();
          return;
        }
      }.bind(this)
    );
    /** По стандарту, в обработчике события в this
     * помещается селектор на котором события обрабатываются.
     * Поэтому нам нужно вручную установить this на наш
     * экземпляр класса, который мы пишем с помощью .bind().
     */

    //обработаем клавишу escape и tab
    window.addEventListener(
      'keydown',
      function (e) {
        //закрытие окна по escape
        if (e.which == 27 && this.isOpened) {
          e.preventDefault();
          this.close();
          return;
        }

        /** Вызовем метод для управления фокусом по Tab
         * и всю ответственность переложим на него
         * (создадим его позже)
         */
        if (e.which == 9 && this.isOpened) {
          this.focusCatcher(e);
          return;
        }
      }.bind(this)
    );
  }

  open(selector) {
    this.openedWindow = this._nextWindows;
    this._modalBlock = this.openedWindow.querySelector('.hystmodal__window');

    /** Вызываем метод управления скроллом
     * он будет блокировать/разблокировать
     * страницу в зависимости от свойства this.isOpened
     */
    this._bodyScrollControl();
    HystModal._shadow.classList.add('hystmodal__shadow--show');
    this.openedWindow.classList.add('hystmodal--active');
    this.openedWindow.setAttribute('aria-hidden', 'false');

    this.focusContol(); //вызываем метод перевода фокуса (см. ниже)
    this.isOpened = true;
  }

  close() {
    /**
     * Метод закрытия текущего окна. Код упрощён
     * подробнее в статье далее.
     */
    if (!this.isOpened) {
      return;
    }
    this.openedWindow.classList.remove('hystmodal--active');
    HystModal._shadow.classList.remove('hystmodal__shadow--show');
    this.openedWindow.setAttribute('aria-hidden', 'true');

    //возвращаем фокус на элемент которым открылось окно
    this.focusContol();

    //возвращаем скролл
    this._bodyScrollControl();
    this.isOpened = false;
  }

  _bodyScrollControl() {
    let html = document.documentElement;
    if (this.isOpened === true) {
      //разблокировка страницы
      html.classList.remove('hystmodal__opened');
      html.style.marginRight = '';
      window.scrollTo(0, this._scrollPosition);
      html.style.top = '';
      return;
    }

    //блокировка страницы
    this._scrollPosition = window.pageYOffset;
    html.style.top = -this._scrollPosition + 'px';
    html.classList.add('hystmodal__opened');
  }
}
