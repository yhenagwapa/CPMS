export class SignatoryViewModal {
  constructor(page) {
    this.modal = page.locator('#SignatoryInfo');

    this.title = this.modal.locator('#title');
    this.fname = this.modal.locator('#fname');
    this.lname = this.modal.locator('#lname');
    this.mi = this.modal.locator('#mi');
    this.initials = this.modal.locator('#initials');
    this.position = this.modal.locator('#position');
    this.sTree = this.modal.locator('#s_tree');
    this.sSignatory = this.modal.locator('#s_signatory');
    this.gl_check = this.modal.locator('#gl_check');
    this.gis_ce_check = this.modal.locator('#gis_ce_check');

    this.close = this.modal.getByLabel('Close');
  }
}