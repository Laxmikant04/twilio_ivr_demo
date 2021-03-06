(function(app) {
  app.AppComponent =
    ng.core.Component({
      selector: 'dialer-app',
      template: `
  <div id="dialer">
    <dialer-input (onChangeNumber)="handleChangeNumber($event)"></dialer-input>

    <audio-controls [onPhone]="onPhone" [muted]="muted" [disabled]="!isValidNumber"
        (onClickCall)="toggleCall()" (onClickMute)="toggleMute()"></audio-controls>

    <dtmf *ngIf="onPhone" (onDigitClick)="sendDigit($event)"></dtmf>

    <statuslog [status]="logtext" ></statuslog>

  </div>`
    })
    .Class({

      constructor: function() {
        this.onPhone = false;
        this.muted = false;
        this.isValidNumber = false;
      },

      ngOnInit: function() {
        var self = this;

        // Fetch Twilio capability token from our Node.js server
        $.getJSON('/token').done(function(data) {
          Twilio.Device.setup(data.token);
        }).fail(function(err) {
          console.log(err);
          self.logtext = 'Could not fetch token, see console.log';
        });

        // Configure event handlers for Twilio Device
        Twilio.Device.disconnect(function() {
          self.onPhone = false;
          self.logtext = 'Call ended.';
        });

        Twilio.Device.ready(function() {
          self.logtext = 'Connected';
        });
      },

      // Handle numeric buttons event
      sendDigit: function(digit) {
        Twilio.Device.activeConnection().sendDigits(digit);
      },

      // Handle number change event
      handleChangeNumber: function(event) {
        this.fullNumber = event.fullNumber;
        this.isValidNumber = event.isValid;
      },

      // Make an outbound call with the current number,
      // or hang up the current call
      toggleCall: function() {
        if (!this.onPhone) {
          this.onPhone = true;
          this.muted = false;

          Twilio.Device.connect({number: this.fullNumber});
          this.logtext = `Calling ${this.fullNumber}`;
        } else {
          // hang up call in progress
          Twilio.Device.disconnectAll();
        }

        Twilio.Device.ready(() => {
          self.log = 'Connected';
        });
      },

      // Handle muting
      toggleMute: function() {
        this.muted = !this.muted;
        Twilio.Device.activeConnection().mute(this.muted);
      },
    });
})(window.app || (window.app = {}));

