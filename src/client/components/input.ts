'use strict';

AFRAME.registerComponent('input', {
    _allowedCharacters: [] as string[],
    _isFocused: false,
    _insertionPoint: 0,

    // Initialize the input within the form
    init: function(): void {
        // Construct a string of characters that may be typed into the field
        var chars = 'abcdefghijklmnopqrstuvwxyz';
        chars += chars.toUpperCase();
        chars += '`1234567890-=~!@#$%^&*()_+[]\\{}|;\':",./<>? ';

        // If the input is a text area, new lines are allowed
        if (this._isTypeTextArea()) chars += '\n';

        // Convert the character string to an array
        this._allowedCharacters = chars.split('');
    },

    // Focus the input
    focus(): void {
        this._isFocused = true;
    },

    // Unfocus the input
    unfocus(): void {
        this._isFocused = false;
    },

    // Get the current value of the input
    _getValue(): string {
        return this.el.getAttribute('value');
    },

    // Set the current value of the input
    _setValue(value: string): void {
        this.el.setAttribute('value', value);
    },

    // Get the type of the input
    _getType(): string {
        return this.el.getAttribute('type');
    },

    // Determine if the input is a text box
    _isTypeText: function(): boolean {
        return this._getType() == 'text';
    },

    // Determine if the input is a text area
    _isTypeTextArea: function(): boolean {
        return this._getType() == 'textarea';
    },

    // Determine if the input is a submit button
    _isTypeSubmit: function(): boolean {
        return this._getType() == 'submit';
    },

    // Determine if the input is a close button
    _isTypeClose: function(): boolean {
        return this._getType() == 'close';
    },

    // Determine if the input is a hidden field
    _isTypeHidden: function(): boolean {
        return this.el.getAttribute('type') == 'hidden';
    },

    // Insert a substring into another string at a specified position
    _insertText(original: string, text: string, position: number): string {
        return original.slice(0, position) + text + original.slice(position);
    },

    // Render the input element on the form each frame
    tick: function(time: number, timeDelta: number): void {
        // Hidden inputs should not be rendered
        if (this._isTypeHidden()) return;

        var text: string = '';

        // Submit buttons show [ Submit ] when unfocused, [ SUBMIT ] when focused
        if (this._isTypeSubmit()) {
            text = '[ Submit ]';
            if (this._isFocused) text = text.toUpperCase();

        // Close buttons show [ Close ] when unfocused, [ CLOSE ] when focused
        } else if (this._isTypeClose()) {
            text = '[ Close ]';
            if (this._isFocused) text = text.toUpperCase();

        // Text boxes and text areas are rendered based on their value
        } else if (this._isTypeText() || this._isTypeTextArea()) {
            text = this._getValue();
            if (this._isFocused) {
                // Create the flashing cursor
                var cursor = (time % 800 < 400) ? '|' : ' ';

                // Insert the cursor into the rendered representation of the input's value
                text = this._insertText(text, cursor, this._insertionPoint);
            }
        }

        // Update the textual representation of the input on the form
        this.el.setAttribute('text', {
            baseline: 'top',
            color: 'black',
            value: text
        });
    },

    // Process a keyboard event that is passed to the input
    processKeyboardEvent: function(event: KeyboardEvent): void {
        if (!this._isFocused) return;

        var key = event.key;

        // Hitting enter on a submit button should submit the form
        if (this._isTypeSubmit()) {
            if (key == 'Enter') {
                document.querySelector('[form]').components.form.submit();
            }
        
        // Hitting enter on a close button should close the form.
        } else if (this._isTypeClose()) {
            if (key == 'Enter') {
                document.querySelector('[form]').components.form.remove();
            }

        // Process interactions with text boxes and text areas
        } else if (this._isTypeText() || this._isTypeTextArea()) {
            if (key == 'Enter') key = '\n';

            // If the user is attempting to type text
            if (this._allowedCharacters.includes(key)) {
                var value = this._insertText(this._getValue(), key, this._insertionPoint);
                this._setValue(value);
                this._insertionPoint++;

            // Deleting text
            } else if (key == 'Backspace') {
                if (this._insertionPoint <= 0) return;

                var value = this._getValue();
                value = value.substring(0, this._insertionPoint - 1) +
                    value.substring(this._insertionPoint);
                this._setValue(value);
                this._insertionPoint--;
            
            // Navigation
            } else if (key == 'ArrowLeft') {
                if (this._insertionPoint <= 0) return;
                this._insertionPoint--;
            } else if (key == 'ArrowRight') {
                if (this._insertionPoint > this._getValue().length - 1) return;
                this._insertionPoint++;
            }
        }
    }
});
