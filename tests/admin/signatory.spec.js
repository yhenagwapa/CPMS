// @ts-check
import { test, expect } from "@playwright/test";
import { fakeSignatory } from '../../utils/fakeData';
import { SignatoryViewModal } from '../../pages/signatory';

test.describe.serial("Signatory Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://172.26.120.49/cpms/");

    await page.fill('[name="username"]', "HASINADJAN");
    await page.fill('[name="password"]', "12345");

    await page.getByRole("button", { name: "SIGN IN" }).click();

    await page.waitForTimeout(3000);

    await expect(page.url()).toContain("/admin/home.php");

    await page.goto("https://172.26.120.49/cpms/admin/SignatoryPage.php");

  });

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(3000);

    //logout
    await page.locator('a.nav-link:has-text("Logout")').click();

    const logoutModal = await page.locator("#logoutmodal");
    await expect(logoutModal).toBeVisible();

    console.log("logout modal visible");
    
    await logoutModal.getByRole("link", { name: "Logout" }).click();

    await expect(page.url()).toContain("/cpms/index.php");
  });

  test("Test 1: Can add signatory record.", async ({ page }) => {
    const signatory = fakeSignatory();
    
    const title = signatory.title;
    const firstName = signatory.firstName;
    const middleInitial = signatory.middleInitial;
    const lastName = signatory.lastName;
    const initials = signatory.initials;
    const position = signatory.position;

    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Adding Signatory!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //click add button
    await page.locator('a[data-target="#AddSignatory"]').click();

    //wait for modal
    const modal = page.locator("#AddSignatory");
    await expect(modal).toBeVisible();

    //fill form and save
    await modal.locator('[name="title"]').fill(title);
    await modal.locator('[name="fname"]').fill(firstName);
    await modal.locator('[name="lname"]').fill(lastName);
    await modal.locator('[name="mi"]').fill(middleInitial);
    await modal.locator('[name="initials"]').fill(initials);
    await modal.locator('[name="position"]').fill(position);
    await modal.locator('[name="gis_ce_check"]').check();
    await modal.locator('[name="gl_check"]').check();
    await modal.locator('[name="s_tree"]').selectOption({ label: 'CIS HEAD' });
    await modal.locator('select[name="s_signatory"]').selectOption({ label: 'No' });

    await modal.getByRole("button", { name: "Add" }).click();

    await page.waitForTimeout(3000);

    //search for the added signatory
    await page.locator('input[type="search"]').fill(firstName);

    //click update button
    await page.getByRole("button", { name: "View" }).click();

    //view modal
    const viewModal = page.locator("#SignatoryInfo");
    await expect(viewModal).toBeVisible();

    //verify signatory information
    const viewTitle = viewModal.locator("#title");
    const viewFname = viewModal.locator("#fname");
    const viewLname = viewModal.locator("#lname");
    const viewMinitial = viewModal.locator("#mi");
    const viewInitials = viewModal.locator("#initials");
    const viewPosition = viewModal.locator("#position");
    const viewStree = viewModal.locator("#s_tree");
    const viewSsignatory = viewModal.locator("#s_signatory");

    await expect(viewTitle).toHaveValue(title);
    await expect(viewFname).toHaveValue(firstName);
    await expect(viewLname).toHaveValue(lastName);
    await expect(viewMinitial).toHaveValue(middleInitial);
    await expect(viewInitials).toHaveValue(initials);
    await expect(viewPosition).toHaveValue(position);
    await expect(viewModal.locator("#s_tree")).toHaveText(/CIS HEAD/);
    await expect(viewModal.locator("#s_signatory")).toHaveText(/De-Activate/);
    await expect(viewModal.locator('#gis_ce_check')).toBeChecked();
    await expect(viewModal.locator('#gl_check')).toBeChecked();
    
    //close modal
    await viewModal.getByLabel('Close').click();
  });

  test("Test 2: Limit special characters in the text fields.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Adding Signatory!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //click add button
    await page.locator('a[data-target="#AddSignatory"]').click();

    //wait for modal
    const modal = page.locator("#AddSignatory");
    await expect(modal).toBeVisible();

    //fill form and save
    await modal.locator('[name="title"]').fill("123!@#$%^&*()-.,");
    await modal.locator('[name="fname"]').fill("123!@#$%^&*()-.,");
    await modal.locator('[name="lname"]').fill("123!@#$%^&*()-.,");
    await modal.locator('[name="mi"]').fill("-");
    await modal.locator('[name="initials"]').fill( "OOO");
    await modal.locator('[name="position"]').fill("123!@#$%^&*()-.,");
    await modal.locator('[name="gis_ce_check"]').check();
    await modal.locator('[name="gl_check"]').check();
    await modal.locator('[name="s_tree"]').selectOption({ label: 'CIS HEAD' });
    await modal.locator('select[name="s_signatory"]').selectOption({ label: 'No' });

    await modal.getByRole("button", { name: "Add" }).click();

    await page.waitForTimeout(3000);

    //search for the added signatory
    await page.locator('input[type="search"]').fill('-.,');

    //click update button
    await page.getByRole("button", { name: "View" }).click();

    //view modal
    const viewModal = page.locator("#SignatoryInfo");
    await expect(viewModal).toBeVisible();

    //verify that some special characters are not saved
    await expect(viewModal.locator('#title')).toHaveValue("-.,");
    await expect(viewModal.locator('#fname')).toHaveValue("-.,");
    await expect(viewModal.locator('#lname')).toHaveValue("-.,");
    await expect(viewModal.locator('#mi')).toHaveValue("-");
    await expect(viewModal.locator('#initials')).toHaveValue("OOO");
    await expect(viewModal.locator('#position')).toHaveValue("-.,");
    await expect(viewModal.locator("#s_tree")).toHaveText(/CIS HEAD/);
    await expect(viewModal.locator("#s_signatory")).toHaveText(/De-Activate/);
    await expect(viewModal.locator('#gis_ce_check')).toBeChecked();
    await expect(viewModal.locator('#gl_check')).toBeChecked();
    
    //close modal
    await viewModal.getByLabel('Close').click();
  });

  test("Test 3:Cannot add signatory if one or more required fields is/are empty.", async ({ page }) => {
    const signatory = fakeSignatory();
    
    const title = signatory.title;
    const position = signatory.position;

    //click add button
    await page.locator('a[data-target="#AddSignatory"]').click();

    const modal = page.locator("#AddSignatory")
    await expect(modal).toBeVisible();

    //fill out form and leave one or more required fields empty
    await modal.locator('[name="title"]').fill(title);
    await modal.locator('[name="mi"]').fill("S");
    await modal.locator('[name="initials"]').fill( "SSS");
    await modal.locator('[name="position"]').fill(position);
    await modal.locator('[name="gis_ce_check"]').check();
    await modal.locator('[name="gl_check"]').check();
    await modal.locator('[name="s_tree"]').selectOption({ label: 'ASSISTANT TO CIS HEAD' });
    await modal.locator('select[name="s_signatory"]').selectOption({ label: 'No' });

    await modal.getByRole("button", { name: "Add" }).click();

    await page.waitForTimeout(3000);

    //capture if there is a validation message
    const checkValidationMessage = (el) => {
      if (el instanceof HTMLInputElement) {
        return el.validationMessage;
      }
      return null;
    };

    //verify validation message
    const firstnamemsg = await page.locator('#fname').evaluate(checkValidationMessage);
    expect(firstnamemsg).toBe("Please fill out this field.");

    //close modal
    await modal.getByLabel('Close').click();
  });

  test("Test 4: Can add signatory if one or more optional fields is/are empty.", async ({ page }) => {
    const signatory = fakeSignatory();
    const view = new SignatoryViewModal(page);
    
    const firstName = signatory.firstName;
    const lastName = signatory.lastName;
    const initials = signatory.noMIinitials;
    const position = signatory.position;

    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Adding Signatory!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //click add button
    await page.locator('a[data-target="#AddSignatory"]').click();

    //wait for modal
    const modal = page.locator("#AddSignatory");
    await expect(modal).toBeVisible();

    //fill form, leave optional fields empty and save
    await modal.locator('[name="fname"]').fill(firstName);
    await modal.locator('[name="lname"]').fill(lastName);
    await modal.locator('[name="initials"]').fill(initials);
    await modal.locator('[name="position"]').fill(position);
    await modal.locator('[name="gl_check"]').check();
    await modal.locator('[name="s_tree"]').selectOption({ label: 'CIS HEAD' });
    await modal.locator('select[name="s_signatory"]').selectOption({ label: 'No' });

    await modal.getByRole("button", { name: "Add" }).click();

    await page.waitForTimeout(3000);

    //search for the added signatory
    await page.locator('input[type="search"]').fill(firstName + ' ' + lastName);

    //click update button
    await page.getByRole("button", { name: "View" }).click();

    //view modal
    await expect(view.modal).toBeVisible();

    //verify signatory information
    await expect(view.title).toHaveValue("");
    await expect(view.fname).toHaveValue(firstName);
    await expect(view.lname).toHaveValue(lastName);
    await expect(view.mi).toHaveValue("");
    await expect(view.initials).toHaveValue(initials);
    await expect(view.position).toHaveValue(position);
    await expect(view.sTree).toHaveText(/CIS HEAD/);
    await expect(view.sSignatory).toHaveText(/De-Activate/);
    await expect(view.gis_ce_check).not.toBeChecked();
    await expect(view.gl_check).toBeChecked();
    
    //close modal
    await view.close.click();
  });

  test("Cannot add duplicate signatory record.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Signatory Already Exist!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = page.locator('table tbody tr').nth(0);
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Signatory list is empty. Skipping test.");
    }

    //click view button
    const row = page.locator('table tbody tr').nth(10);
    await row.locator('button:has-text("View")').click();

    //view modal
    const viewModal = page.locator("#SignatoryInfo");
    await expect(viewModal).toBeVisible();

    //get signatory information
    const title = await viewModal.locator("#title").innerText();
    const fname = await viewModal.locator("#fname").innerText();
    const lname = await viewModal.locator("#lname").innerText();
    const mi = await viewModal.locator("#mi").innerText();
    const initials = await viewModal.locator("#initials").innerText();
    const position = await viewModal.locator("#position").innerText();
    const gis_ce_check = await viewModal.locator("#gis_ce_check").isChecked();
    const gl_check = await viewModal.locator("#gl_check").isChecked();
    const s_tree = await viewModal.locator("#s_tree").innerText();
    const s_signatory = await viewModal.locator("#s_signatory").innerText();

    //close modal
    await viewModal.getByLabel('Close').click();

    //click add button
    await page.locator('a[data-target="#AddProvider"]').click();

    const modal = page.locator("#AddProvider")
    await expect(modal).toBeVisible();

    //fill out form and save
    await modal.locator('[name="title"]').fill(title);
    await modal.locator('[name="fname"]').fill(fname);
    await modal.locator('[name="lname"]').fill(lname);
    await modal.locator('[name="mi"]').fill(mi);
    await modal.locator('[name="initials"]').fill(initials);
    await modal.locator('[name="position"]').fill(position);
    await modal.locator('[name="gis_ce_check"]').setChecked(gis_ce_check);
    await modal.locator('[name="gl_check"]').setChecked(gl_check);
    await modal.locator('[name="s_tree"]').selectOption({ label: s_tree });
    await modal.locator('select[name="s_signatory"]').selectOption({ label: s_signatory });

    await modal.getByRole("button", { name: "Add" }).click();

    await page.waitForTimeout(3000);
  });

  test("Able to view signatory information.", async ({ page }) => {
    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Signatory list is empty. Skipping test.");
    }

    //search for a signatory
    await page.locator('input[type="search"]').fill('Atty. Rosa R Rosal');

    //get first row values
    const row1 = page.locator('table tbody tr').nth(0);
    const signatoryName1 = row1.locator('td').nth(1).innerText();
    const position1 = row1.locator('td').nth(2).innerText();

    //click view button
    await row1.locator('button:has-text("View")').click();

    //view modal
    const viewModal1 = page.locator("#SignatoryInfo");
    await expect(viewModal1).toBeVisible();

    //get names
    const firstName = await viewModal1.locator('#fname').innerText();
    const middleName = await viewModal1.locator('#mi').innerText();
    const lastName = await viewModal1.locator('#lname').innerText(); 

    //merge names
    const modalFullName =
    `${firstName} ${middleName} ${lastName}`
        .replace(/\s+/g, ' ') // remove double spaces
        .trim();
    
    //compare names
    expect(modalFullName).toBe(signatoryName1);
    expect(await viewModal1.locator("#position").innerText()).toBe(position1);

    //close modal
    await viewModal1.getByLabel('Close').click();

    //view another provider information
    await page.locator('input[type="search"]').fill('');

    const row2 = page.locator('table tbody tr').nth(8);
    const signatoryName2 = row1.locator('td').nth(1).innerText();
    const position2 = row1.locator('td').nth(2).innerText();

    //click view button
    await row2.locator('button:has-text("View")').click();

    //view modal
    const viewModal2 = page.locator("#SignatoryInfo");
    await expect(viewModal1).toBeVisible();

    //get names
    const firstName2 = await viewModal2.locator('#fname').innerText();
    const middleName2 = await viewModal2.locator('#mi').innerText();
    const lastName2 = await viewModal2.locator('#lname').innerText(); 

    //merge names
    const modalFullName2 =
    `${firstName2} ${middleName2} ${lastName2}`
        .replace(/\s+/g, ' ') // remove double spaces
        .trim();
    
    //compare names
    expect(modalFullName2).toBe(signatoryName2);
    expect(await viewModal2.locator("#position").innerText()).toBe(position2);

    //close modal
    await viewModal1.getByLabel('Close').click();
  });

  test("Can update provider information.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Updating Signatory!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //search for a provider
    await page.locator('input[type="search"]').fill('Rosa');

    //click update button
    await page.waitForSelector('table');
    await page.getByRole("button", { name: "Update" }).click();

    //update modal
    const updateModal = page.locator("#UpdateSignatory");
    await expect(updateModal).toBeVisible();

    //update signatory information
    await updateModal.locator('[name="title"]').fill(" Edited");
    await updateModal.locator('[name="fname"]').fill(" Edited");
    await updateModal.locator('[name="lname"]').fill(" Edited");
    await updateModal.locator('[name="mi"]').fill("E");
    await updateModal.locator('[name="initials"]').fill( "RRRE");
    await updateModal.locator('[name="position"]').fill("Director III  Edited");
    await updateModal.locator('[name="gis_ce_check"]').setChecked(false);
    await updateModal.locator('[name="gl_check"]').setChecked(false);
    await updateModal.locator('[name="s_tree"]').selectOption({ label: 'ASSISTANT TO CIS HEAD' });
    await updateModal.locator('select[name="s_signatory"]').selectOption({ label: 'No' }); 

    await updateModal.getByRole("button", { name: "Update" }).click();

    //verify that the information is updated
    await page.waitForTimeout(3000);

    await page.locator('input[type="search"]').fill('Atty. Rosa R. Rosal Edited');
    await page.waitForSelector('table');
    await page.getByRole("button", { name: "View" }).click();

    //view modal
    const viewModal = page.locator("#SigantoryInfo");
    await expect(viewModal).toBeVisible();

    //verify signatory information
    expect(await viewModal.locator("#title").innerText()).toBe("Atty. Edited");
    expect(await viewModal.locator("#fname").innerText()).toBe("Rosa Edited");
    expect(await viewModal.locator("#lname").innerText()).toBe("Rosal Edited");
    expect(await viewModal.locator("#mi").innerText()).toBe("E");
    expect(await viewModal.locator("#initials").innerText()).toBe("RRRE");
    expect(await viewModal.locator("#position").innerText()).toBe("Director III Edited");
    expect(await viewModal.locator("#gis_ce_check").isChecked()).toBe(false);
    expect(await viewModal.locator("#gl_check").isChecked()).toBe(false);
    expect(await viewModal.locator("#s_tree").innerText()).toBe("ASSISTANT TO CIS HEAD");
    expect(await viewModal.locator("#s_signatory").innerText()).toBe("No");

    //close modal
    await viewModal.getByLabel('Close').click();

  });

  test("Limit special characters in the text fields when updating signatory information.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Updating Signatory!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //search for a provider
    await page.locator('input[type="search"]').fill('-.,');

    //click update button
    await page.waitForSelector('table');
    await page.getByRole("button", { name: "Update" }).click();

    //update modal
    const updateModal = page.locator("#UpdateSignatory");
    await expect(updateModal).toBeVisible();

    //update signatory information
    await updateModal.locator('[name="title"]').fill(" Edited!@#$%^&*()-.,");
    await updateModal.locator('[name="fname"]').fill(" Edited!@#$%^&*()-.,");
    await updateModal.locator('[name="lname"]').fill(" Edited!@#$%^&*()-.,");
    await updateModal.locator('[name="mi"]').fill("");
    await updateModal.locator('[name="mi"]').fill("A");
    await updateModal.locator('[name="initials"]').fill( " Edited!@#$%^&*()-.,");
    await updateModal.locator('[name="position"]').fill(" Edited!@#$%^&*()-.,");
    await updateModal.locator('[name="gis_ce_check"]').setChecked(false);
    await updateModal.locator('[name="gl_check"]').setChecked(false);
    await updateModal.locator('[name="s_tree"]').selectOption({ label: 'ASSISTANT TO CIS HEAD' });
    await updateModal.locator('select[name="s_signatory"]').selectOption({ label: 'No' }); 

    await updateModal.getByRole("button", { name: "Update" }).click();

    //verify that the information is updated
    await page.waitForTimeout(3000);

    await page.locator('input[type="search"]').fill('');
    await page.locator('input[type="search"]').fill('-.,');

    const row = page.locator('table tbody tr').nth(0);
    await row.locator('button:has-text("View")').click();

    //view modal
    const viewModal = page.locator("#SigantoryInfo");
    await expect(viewModal).toBeVisible();

    //verify signatory information
    expect(await viewModal.locator("#title").innerText()).toBe("-.,Edited-.,");
    expect(await viewModal.locator("#fname").innerText()).toBe("-.,Edited-.,");
    expect(await viewModal.locator("#lname").innerText()).toBe("-.,Edited-.,");
    expect(await viewModal.locator("#mi").innerText()).toBe("A");
    expect(await viewModal.locator("#initials").innerText()).toBe(" Edited-.,");
    expect(await viewModal.locator("#position").innerText()).toBe(" Edited-.,");
    expect(await viewModal.locator("#gis_ce_check").isChecked()).toBe(false);
    expect(await viewModal.locator("#gl_check").isChecked()).toBe(false);
    expect(await viewModal.locator("#s_tree").innerText()).toBe("ASSISTANT TO CIS HEAD");
    expect(await viewModal.locator("#s_signatory").innerText()).toBe("No");

    //close modal
    await viewModal.getByLabel('Close').click();

  });

  test("Cannot update service provider if one or more required fields is/are empty.", async ({ page }) => {
    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //search for a provider
    await page.getByRole("search", { name: "Search" }).fill("Test Addressee Name Edited");

    //click update button
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "Update" }).click();

    //update modal
    const updateModal = page.locator("#UpdateProvider");
    await expect(updateModal).toBeVisible();

    //update provider information
    await updateModal.locator("#addresseename").fill(' !@#$%^&*()_+-.,');
    await updateModal.locator("#addresseeposition").fill(' !@#$%^&*()_+-.,');
    await updateModal.locator("#addresseetomention").fill(' !@#$%^&*()_+-.,');

    await updateModal.getByRole("button", { name: "Update" }).click();

    //capture if there is a validation message
    const checkValidationMessage = (el) => {
      if (el instanceof HTMLInputElement) {
        return el.validationMessage;
      }
      return null;
    };

    //verify validation message
    const companynamemsg = await updateModal.locator('#companyname').evaluate(checkValidationMessage);
    expect(companynamemsg).toBe("Please fill out this field.");

    //close modal
    await updateModal.getByLabel('Close').click();

  });

  test("Can update service provider if one or more optional fields is/are empty.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Successfully Updating Company!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //search for a provider
    await page.getByRole("search", { name: "Search" }).fill("Juan Company Name");

    //click update button
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "Update" }).click();

    //update modal
    const updateModal = page.locator("#UpdateProvider");
    await expect(updateModal).toBeVisible();

    //update provider information
    await updateModal.locator("#addresseeposition").fill(' Edited');
    await updateModal.locator("#addresseetomention").fill(' Edited');
    await updateModal.locator("companyname").fill(' Edited');
    await updateModal.locator("#companyaddress").fill(' Edited'); 

    await updateModal.getByRole("button", { name: "Update" }).click();

    //verify that the information is updated
    await page.waitForTimeout(3000);
    await page.getByRole("search", { name: "Search" }).fill("Juan Company Name Edited");
    await page.waitForSelector('table');
    await page.getByRole("cell", { name: "View" }).click();

    //view modal
    const viewModal = page.locator("#ProviderInfo");
    await expect(viewModal).toBeVisible();

    //verify provider information
    expect(await viewModal.locator("#addresseeposition").innerText()).toBe("The Manager Edited");
    expect(await viewModal.locator("#tomention").innerText()).toBe("Juana Dela Cruz Edited");
    expect(await viewModal.locator("#companyname").innerText()).toBe("Juana Dela Cruz Edited");
    expect(await viewModal.locator("#companyaddress").innerText()).toBe("Juan Company Address Edited");

    //close modal
    await viewModal.getByLabel('Close').click();

  });

  test("Cannot update service provider if information already exists.", async ({ page }) => {
    //detect browser alert
    page.once('dialog', async dialog => {
      // Verify the text matches successful message
      if (dialog.message() === 'Company Already Exist!') {
        await dialog.accept(); // Clicks the "OK" button
      } else {
        // If it's a different alert, dismiss it
        console.log(`Unexpected alert: ${dialog.message()}`);
        await dialog.dismiss();
      }
    });

    //check if table is not empty
    const rows = await page.locator('table tbody tr');
    const rowsCount  = await rows.count();

    if (rowsCount === 0) {
        test.skip(true, "Provider list is empty. Skipping test.");
    }

    //click view button
    const row1 = page.locator('table tbody tr').nth(2);
    await row1.locator('button:has-text("View")').click();

    //view modal
    const viewModal = page.locator("#ProviderInfo");
    await expect(viewModal).toBeVisible();

    //get provider information
    const addresseename = await viewModal.locator("#addresseename").innerText();
    const addresseeposition = await viewModal.locator("#addresseeposition").innerText();
    const addresseetomention = await viewModal.locator("#tomention").innerText();
    const companyname = await viewModal.locator("#companyname").innerText();
    const companyaddress = await viewModal.locator("#companyaddress").innerText();

    //close modal
    await viewModal.getByLabel('Close').click();

    //click update button
    const row2 = page.locator('table tbody tr').nth(3);
    await row2.locator('button:has-text("Update")').click();

    const updateModal = page.locator("#UpdateProvider");
    await expect(updateModal).toBeVisible();

    //update provider information
    await updateModal.locator("#addresseename").fill(addresseename);
    await updateModal.locator("#addresseeposition").fill(addresseeposition);
    await updateModal.locator("#addresseetomention").fill(addresseetomention);
    await updateModal.locator("companyname").fill(companyname);
    await updateModal.locator("#companyaddress").fill(companyaddress); 

    await updateModal.getByRole("button", { name: "Update" }).click();

    await page.waitForTimeout(3000);
  });
});
