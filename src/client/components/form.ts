'use strict';

AFRAME.registerComponent('form', {
    _inputs: [] as Element[],
    _tab_order: [] as number[],
    _selected: 0,

    init: function(): void {
        // Disable wasd movement and the cursor
        document.querySelector('[camera]').removeAttribute('wasd-controls');
        document.querySelector('#cursor').removeAttribute('cursor');

        // Update the list of child input components
        this._updateInputs();

        // Listen for key presses
        window.addEventListener('keydown', this._processKeyboardEvent);
    },

    remove: function() {
        // Remove the form from the DOM
        document.querySelector('[formmount]').innerHTML = '';

        // Enable wasd movement and the cursor
        document.querySelector('[camera]').setAttribute('wasd-controls', '');
        document.querySelector('#cursor').setAttribute('cursor', '');

        // Stop listening for key presses
        window.removeEventListener('keydown', this._processKeyboardEvent);
    },

    _updateInputs: function(): void {
        this._inputs = [...this.el.querySelectorAll('[input]')];
        this._tab_order = [];
        for (var i = 0; i < this._inputs.length; i++) {
            var input = this._inputs[i];
            var type = input.getAttribute('type');
            if (type !== 'hidden') {
                this._tab_order.push(i);
            }
        }
        this._selected = 0;
        this.getSelectedInputComponent().focus();
    },

    tab(): void {
        this.getSelectedInputComponent().unfocus();
        this._selected++;
        this._selected %= this._tab_order.length;
        this.getSelectedInputComponent().focus();
    },

    getSelectedInputComponent(): any {
        var index = this._tab_order[this._selected];
        var component = (this._inputs[index] as any).components.input;
        return component;
    },

    _processKeyboardEvent: function(event: KeyboardEvent): void {
        event.preventDefault();

        var form = document.querySelector('[form]').components.form;

        // Tab between focusable inputs
        if (event.key == 'Tab') {
            form.tab();
            return;
        }

        // Forward the keyboard event to the selected control
        var input_component = form.getSelectedInputComponent();
        input_component.processKeyboardEvent(event);
    },

    submit: function() {
        var inputs = [...this.el.querySelectorAll('[input]')]
            .filter((elm) => elm.hasAttribute('name'));
        
        var form_data = new Map();
        for (var input of inputs) {
            var name = input.getAttribute('name');
            var value = input.getAttribute('value');
            form_data.set(name, value);
        }

        console.log(form_data);
        this.remove();
    }
});
