/**
 * Progressive enhancement for the site's forms.
 * - Without JS the browser's native validation still works.
 * - With JS: Persian inline error messages, and submission to the endpoint in
 *   the form's `data-endpoint` attribute. While no endpoint is configured the
 *   form tells the visitor how to reach the company directly instead of
 *   silently reloading the page.
 */
const MESSAGES = {
  required: 'این بخش را کامل کنید.',
  email: 'ایمیل را به شکل name@example.com وارد کنید.',
  tel: 'شماره تماس را فقط با رقم وارد کنید؛ مثل ۰۹۱۲۱۲۳۴۵۶۷.',
};

const toLatinDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

function validate(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  const value = control.value.trim();
  if (control.required && !value) return MESSAGES.required;
  if (!value) return '';
  if (control instanceof HTMLInputElement && control.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return MESSAGES.email;
  }
  if (control instanceof HTMLInputElement && control.type === 'tel' && !/^\+?[\d\s-]{7,15}$/.test(toLatinDigits(value))) {
    return MESSAGES.tel;
  }
  return '';
}

function showError(control: HTMLElement, message: string) {
  const errorId = control.getAttribute('aria-describedby');
  const slot = errorId ? document.getElementById(errorId) : null;
  if (slot) slot.textContent = message;
  if (message) control.setAttribute('aria-invalid', 'true');
  else control.removeAttribute('aria-invalid');
}

export function initForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
    form.noValidate = true;
    const status = form.querySelector<HTMLElement>('[data-form-status]');
    const controls = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('.field__input'),
    );

    controls.forEach((control) =>
      control.addEventListener('blur', () => {
        if (control.getAttribute('aria-invalid') === 'true' || control.value) showError(control, validate(control));
      }),
    );

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      let firstInvalid: HTMLElement | undefined;
      for (const control of controls) {
        const message = validate(control);
        showError(control, message);
        if (message && !firstInvalid) firstInvalid = control;
      }
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const endpoint = form.dataset.endpoint;
      if (!status) return;
      if (!endpoint) {
        status.dataset.tone = 'notice';
        status.textContent = form.dataset.offlineMessage ?? '';
        return;
      }

      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      button?.setAttribute('disabled', '');
      status.dataset.tone = '';
      status.textContent = 'در حال ارسال…';
      try {
        const response = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
        if (!response.ok) throw new Error(String(response.status));
        form.reset();
        status.textContent = form.dataset.successMessage ?? '';
      } catch {
        status.dataset.tone = 'notice';
        status.textContent = form.dataset.errorMessage ?? '';
      } finally {
        button?.removeAttribute('disabled');
      }
    });
  });
}
