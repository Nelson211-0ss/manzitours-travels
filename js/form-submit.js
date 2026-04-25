/*!
 * Honzi Tours – Shared form submitter.
 *
 * On submit, every form is delivered automatically to the company in TWO ways:
 *
 *   1. EMAIL  →  info@honzitoursandtravel.com
 *      Sent via FormSubmit.co (free, no signup, no backend).
 *      The PDF the form generates is attached to the email.
 *
 *   2. WHATSAPP  →  +971 55 135 2382
 *      Sent via CallMeBot (free, no backend) IF the company API key
 *      is configured below. Otherwise we transparently fall back to
 *      opening wa.me in a new tab with the message prefilled (one tap
 *      to send) so nothing breaks during setup.
 *
 * ─── ONE-TIME SETUP (do these once, then forms send 100% automatically) ────
 *
 *   FormSubmit (email):
 *     • The first form submitted from the live site triggers a confirmation
 *       email from FormSubmit to info@honzitoursandtravel.com.
 *     • Open it and click the activation link ONCE. Done.
 *
 *   CallMeBot (WhatsApp):
 *     1. From the company WhatsApp (+971 55 135 2382), add the contact
 *        +34 644 51 95 30 and send it the message:   I allow callmebot to send me messages
 *     2. CallMeBot replies with an API key (a number).
 *     3. Paste that number into the CALLMEBOT_API_KEY constant below.
 *     4. Save and redeploy. Every submission now lands directly in the
 *        company WhatsApp – zero taps required.
 *
 *   Reference: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 * ──────────────────────────────────────────────────────────────────────────
 */
(function () {
  var COMPANY_EMAIL    = 'info@honzitoursandtravel.com';
  var WHATSAPP_NUMBER  = '971551352382';
  var FORMSUBMIT_URL   = 'https://formsubmit.co/ajax/' + COMPANY_EMAIL;

  // Paste the API key returned by CallMeBot here once the one-time
  // authorization has been completed from the company WhatsApp number.
  // While this is empty, WhatsApp falls back to opening wa.me in a new tab.
  var CALLMEBOT_API_KEY = '';

  function showToast(message, type) {
    var existing = document.getElementById('honzi-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'honzi-toast';
    var bg = type === 'error' ? '#e11d48' : '#059669';
    toast.style.cssText =
      'position:fixed;left:50%;top:24px;transform:translateX(-50%);' +
      'z-index:10000;padding:14px 22px;border-radius:14px;' +
      'font:600 14px/1.4 "Google Sans Flex",system-ui,sans-serif;' +
      'color:#fff;background:' + bg + ';box-shadow:0 10px 30px rgba(0,0,0,.35);' +
      'max-width:90vw;text-align:center;opacity:0;transition:opacity .25s ease;';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.style.opacity = '1'; });

    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 300);
    }, 5000);
  }

  function buildFormData(opts) {
    var fd = new FormData();
    fd.append('_subject', opts.title + ' – ' + (opts.data.name || 'New request'));
    fd.append('_template', 'table');
    fd.append('_captcha', 'false');
    fd.append('Form Type', opts.title);

    Object.keys(opts.data).forEach(function (key) {
      var label = key.replace(/([A-Z])/g, ' $1').replace(/^./, function (s) { return s.toUpperCase(); });
      fd.append(label, opts.data[key] || '-');
    });

    if (opts.pdf && opts.fileName) {
      fd.append('attachment', opts.pdf, opts.fileName);
    }
    return fd;
  }

  function sendEmail(opts) {
    return fetch(FORMSUBMIT_URL, {
      method: 'POST',
      body: buildFormData(opts),
      headers: { Accept: 'application/json' }
    }).then(function (r) {
      return r.json().catch(function () { return { success: 'true' }; });
    }).then(function (json) {
      var ok = json && (json.success === 'true' || json.success === true);
      if (!ok) throw new Error((json && json.message) || 'Email service rejected the request');
      return true;
    });
  }

  function sendWhatsAppViaCallMeBot(message) {
    var url = 'https://api.callmebot.com/whatsapp.php' +
      '?phone='  + encodeURIComponent('+' + WHATSAPP_NUMBER) +
      '&text='   + encodeURIComponent(message || '') +
      '&apikey=' + encodeURIComponent(CALLMEBOT_API_KEY);

    return fetch(url, { method: 'GET', mode: 'no-cors' })
      .then(function () { return true; });
  }

  function openWhatsAppFallback(message) {
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message || '');
    window.open(url, '_blank', 'noopener');
  }

  function deliverWhatsApp(message) {
    if (CALLMEBOT_API_KEY) {
      return sendWhatsAppViaCallMeBot(message).catch(function (err) {
        console.warn('[HonziForm] CallMeBot failed, falling back to wa.me:', err);
        openWhatsAppFallback(message);
      });
    }
    openWhatsAppFallback(message);
    return Promise.resolve();
  }

  /**
   * Submit a Honzi Tours form.
   * @param {Object} opts
   * @param {string} opts.title       e.g. "Flight Booking Request"
   * @param {Object} opts.data        plain key/value object of form fields
   * @param {string} opts.message     formatted WhatsApp/email body text
   * @param {Blob}   [opts.pdf]       generated PDF blob (optional)
   * @param {string} [opts.fileName]  filename for the PDF attachment
   * @param {HTMLFormElement} [opts.form]   the <form> element (will be reset on success)
   * @param {HTMLButtonElement} [opts.button] the submit button (re-enabled at the end)
   * @param {string} [opts.buttonHTML] original button innerHTML to restore
   */
  function submit(opts) {
    var form = opts.form;
    var btn = opts.button;
    var origLabel = opts.buttonHTML || (btn ? btn.innerHTML : '');

    var emailPromise    = sendEmail(opts).catch(function (err) {
      console.error('[HonziForm] email send failed:', err);
      return { failed: true, err: err };
    });
    var whatsappPromise = deliverWhatsApp(opts.message);

    return Promise.all([emailPromise, whatsappPromise])
      .then(function (results) {
        var emailFailed = results[0] && results[0].failed;
        if (emailFailed) {
          showToast('Sent via WhatsApp. Email service was temporarily unavailable.', 'error');
        } else if (CALLMEBOT_API_KEY) {
          showToast('Request sent! Our team will be in touch shortly.');
        } else {
          showToast('Request emailed! WhatsApp opened – tap Send to confirm.');
        }
        if (form) form.reset();
      })
      .catch(function (err) {
        console.error('[HonziForm] submission error:', err);
        showToast('Something went wrong. Please try again or WhatsApp us at +971 55 135 2382.', 'error');
      })
      .then(function () {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origLabel;
          if (window.feather) window.feather.replace();
        }
      });
  }

  window.HonziForm = {
    COMPANY_EMAIL:     COMPANY_EMAIL,
    WHATSAPP_NUMBER:   WHATSAPP_NUMBER,
    CALLMEBOT_ENABLED: !!CALLMEBOT_API_KEY,
    submit:            submit,
    openWhatsApp:      openWhatsAppFallback,
    showToast:         showToast
  };
})();
