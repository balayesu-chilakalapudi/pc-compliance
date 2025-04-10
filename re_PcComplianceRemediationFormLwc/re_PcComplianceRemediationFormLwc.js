import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
/*
import savePCChanges from "@salesforce/apex/RE_PCComplianceRemediationFormLWCCtrl.savePCChangesData";
import getPCChanges from "@salesforce/apex/RE_PCComplianceRemediationFormLWCCtrl.getPCChangesData";
import deletePCChanges from "@salesforce/apex/RE_PCComplianceRemediationFormLWCCtrl.deletePCChangesData";
*/
import getEnrollmentDetails from "@salesforce/apex/RE_PCComplianceRemediationFormLWCCtrl.fetchWorkItemDetail";
import submitWorkflowItem from "@salesforce/apex/RE_PCComplianceRemediationFormLWCCtrl.submitWorkflowItemData";
import RE_Enrollment_Step1_Para_Before from '@salesforce/label/c.RE_Enrollment_Step1_Para_Before';
import RE_Enrollment_Step1_Para_After from '@salesforce/label/c.RE_Enrollment_Step1_Para_After';
import RE_EmployeeProfile from '@salesforce/label/c.RE_EmployeeProfile';
import PcDeviceName from '@salesforce/label/c.pc_IMAGE_DeviceName';
import PcNewDeviceName from '@salesforce/label/c.pc_IMAGE_NewDeviceName';
import PcDriveSize from '@salesforce/label/c.pc_IMAGE_DriveSize';
import PcOSType from '@salesforce/label/c.pc_IMAGE_OSType';
import PcOSVersion from '@salesforce/label/c.pc_IMAGE_OSVersion';
import PcRAM from '@salesforce/label/c.pc_IMAGE_PCRAM';
import PcProcessor from '@salesforce/label/c.pc_IMAGE_Processor';

//import PcSiteURL from '@salesforce/label/c.pc_IMAGE_SiteURL';

import PcDeviceNameId from '@salesforce/label/c.pc_IMAGE_DeviceNameId';
import PcNewDeviceNameId from '@salesforce/label/c.pc_IMAGE_NewDeviceNameId';
import PcDriveSizeId from '@salesforce/label/c.pc_IMAGE_DriveSizeId';
import PcOSTypeId from '@salesforce/label/c.pc_IMAGE_OSTypeId';
import PcOSVersionId from '@salesforce/label/c.pc_IMAGE_OSVersionId';
import PcRAMId from '@salesforce/label/c.pc_IMAGE_PCRAMId';
import PcProcessorId from '@salesforce/label/c.pc_IMAGE_ProcessorId';


export default class RE_EnrollmentFormCourtesy extends NavigationMixin(LightningElement) {

  @track workflowItemId;
  @track pcObj = { 'sObjectType': 'Workflow_Item_Detail__c', 'RE_Changes_Made_To_PC__c': '', 'workflowitem__c': this.workflowItemId, 'RE_OS_Type_Txt__c':'' };
  @track workflowItemObj = {
    'sObjectType': 'RE_Workflow_Item__c'
  }

  @track pc_IMAGE_DeviceName = PcDeviceName;
  @track pc_IMAGE_NewDeviceName = PcNewDeviceName;
  @track pc_IMAGE_DriveSize = PcDriveSize;// = PC_IMAGES + '/RE_PcDriveSize.png';
  @track pc_IMAGE_OSType = PcOSType;// = PC_IMAGES + '/RE_PcOSVersion.png';
  @track pc_IMAGE_OSVersion = PcOSVersion;// = PC_IMAGES + '/RE_PcOSBuild.png';
  @track pc_IMAGE_PCRAM = PcRAM;// = PC_IMAGES + '/RE_PcRAM.png';
  @track pc_IMAGE_Processor = PcProcessor;

  //@track pc_IMAGE_SiteURL = PcSiteURL;

  @track pc_IMAGE_DeviceNameId=PcDeviceNameId;
  @track pc_IMAGE_NewDeviceNameId=PcNewDeviceNameId;
  @track pc_IMAGE_DriveSizeId=PcDriveSizeId;
  @track pc_IMAGE_OSTypeId=PcOSTypeId;
  @track pc_IMAGE_OSVersionId=PcOSVersionId;
  @track pc_IMAGE_PCRAMId=PcRAMId;
  @track pc_IMAGE_ProcessorId=PcProcessorId;

  @api recordId;
  isLoading = true;
  isConfirmModalOpen = false;
  showException = false;
  enrollmentException = '';
  showEntrollmentForm = false;
  employeeProfileUrl = '/employee-profile';
  enrollmentStep1ParaBefore = RE_Enrollment_Step1_Para_Before;
  enrollmentStep1ParaAfter = RE_Enrollment_Step1_Para_After;
  employeeProfileUrl = RE_EmployeeProfile;
  @track pannelErrorMessage = '';
  @track showPannelErrorMessage = false;

  @track radio_value = '';
  @track show_radio_option1 = false;
  @track show_radio_option2 = false;
  @track show_radio_option3 = false;

  @track option1_DriveSizeBln = false;
  @track option1_OSTypeBln = false;
  @track option1_OSVersionBln = false;
  @track option1_RAMBln = false;

  get radio_options() {
    return [
      { label: 'Report changes/updates to a Tech Computer', value: 'Report changes/updates to a Tech Computer' },
      { label: 'Report addition of new compliant Tech Computer', value: 'Report addition of new compliant Tech Computer' },
      { label: 'Report decommissioning of a non-compliant Tech Computer', value: 'Report decommissioning of a non-compliant Tech Computer' },
    ];
  }


  get ostype_options() {
    return [
      { label: 'Please enter text that contains Windows', value: '' },
      { label: 'Microsoft Windows 10 Pro', value: 'Microsoft Windows 10 Pro' },
      { label: 'Microsoft Windows 10 Business', value: 'Microsoft Windows 10 Business' },
      { label: 'Microsoft Windows 10 Enterprise', value: 'Microsoft Windows 10 Enterprise' },
      { label: 'Microsoft Windows 11 Pro', value: 'Microsoft Windows 11 Pro' },
      { label: 'Microsoft Windows 11 Business', value: 'Microsoft Windows 11 Business' },
      { label: 'Microsoft Windows 11 Enterprise', value: 'Microsoft Windows 11 Enterprise' }
    ];
  }


  @track filesList = [];
  @track enlargeToggle = false;
  
  

  /*enlargeDeviceName(){
    console.log('enlargeDeviceName');
    try{
     let img = this.template.querySelector('.img1');
     if(!this.enlargeToggle){
      this.enlargeToggle=true;
    img.style.transform = "scale(2)";
          // Animation effect
          img.style.transition = "transform 0.25s ease";
          img.style.right= "25%"; 
          img.style.top= "45%";
          img.style.position="fixed";
     }else{
        this.enlargeToggle=false;
        img.style.transform = null;
          // Animation effect
          img.style.transition = "transform 0.25s ease";
          img.style.right= null; 
          img.style.top=null;
          img.style.position=null;
     }
    }catch(err){
      console.log(err.stack);
    }
  }*/

  @track showImageViewModal = false;

  handleRadioChange(event) {
    const selectedOption = event.detail.value;
    if (selectedOption == 'Report changes/updates to a Tech Computer') {
      this.show_radio_option1 = true;
    } else {
      this.show_radio_option1 = false;
    }
    if (selectedOption == 'Report addition of new compliant Tech Computer') {
      this.show_radio_option2 = true;
      this.DriveSizeBln = true;
      this.OSTypeBln = true;
      this.OSVersionBln = true;
      this.ProcessorBln = true;
      this.RamBln = true;
      this.pcObj.RE_OS_Type_Txt__c='';
    } else {
      this.show_radio_option2 = false;
      this.DriveSizeBln = false;
      this.OSTypeBln = false;
      this.OSVersionBln = false;
      this.ProcessorBln = false;
      this.RamBln = false;
    }
    if (selectedOption == 'Report decommissioning of a non-compliant Tech Computer') {
      this.show_radio_option3 = true;
    } else {
      this.show_radio_option3 = false;
    }   
   // this.handleInputValidation();  
    this.pcObj = { 'sObjectType': 'Workflow_Item_Detail__c', 'RE_Changes_Made_To_PC__c': '', 'workflowitem__c': this.workflowItemId, 'RE_PC_Change_Type__c': '', 'RE_PC_Change_Type__c': selectedOption };
   // this.pcObj.RE_PC_Change_Type__c = selectedOption;

  }


  previewHandler(event) {
    let imageId = event.target.dataset.id;
    /*const urlParams = new URLSearchParams(imageId);
    let dLink = urlParams.get('d');
    let oid=urlParams.get('oid').split('00D')[1];
    
    let siteURL=this.pc_IMAGE_SiteURL+oid+dLink;*/
    window.open(imageId, '_blank');

    //, 'location=yes,height='+screen.availHeight+',width='+screen.availWidth+',scrollbars=yes,status=yes');
   /* let documentIds = [];
    documentIds.push(imageId);
    try {
    const valueChangeEvent = new CustomEvent("filepreview", {
      detail: { documentIds }
    });
    // Fire the custom event
    this.dispatchEvent(valueChangeEvent);
    } catch (err) {
      console.log(err.stack);
    }*/
   // console.log('documentIds:' + documentIds);
    //this.openFormModalOpenBln=false;
    
    }

  /* enlargeDeviceName() {
    this.openFormModalOpenBln = false;
   // this.showImageViewModal = true;
   this.pc_IMAGE_View = this.pc_IMAGE_DeviceName;

  }

  enlargeDriveSize() {
    this.openFormModalOpenBln = false;
    this.showImageViewModal = true;
    this.pc_IMAGE_View = this.pc_IMAGE_DriveSize;
  }

  enlargeOSType() {
    this.openFormModalOpenBln = false;
    this.showImageViewModal = true;
    this.pc_IMAGE_View = this.pc_IMAGE_OSType;
  }

  enlargeOSVersion() {
    this.openFormModalOpenBln = false;
    this.showImageViewModal = true;
    this.pc_IMAGE_View = this.pc_IMAGE_OSVersion;
  }

  enlargePCRAM() {
    this.openFormModalOpenBln = false;
    this.showImageViewModal = true;
    this.pc_IMAGE_View = this.pc_IMAGE_PCRAM;
   }*/


  closeImageViewModal() {
    this.showImageViewModal = false;
    this.openFormModalOpenBln = true;
  }




  //pdfFaq= PDF_FAQ;
  @track enrollmentDetail = {
    Name: '',
    ConId: '',
    Phone: '',
    Email: '',
    retailerId: '',
    retailerName: '',
    retailerCode: '',
    approverEmail: '',
    role: '',
    toAccountName: '',
    vehicleInsurance: false,
    programContact: '',
    programEmail: '',
    PersonRole: ''
  }



  @track validation = {
    Name: {
      disable: true,
      required: true
    },
    Phone: {
      disable: true,
      required: true
    },
    Email: {
      disable: true,
      required: true
    },
    retailerName: {
      disable: true,
      required: true
    },
    retailerCode: {
      disable: true,
      required: true
    },
    role: {
      disable: true,
      required: true
    },
    approverEmail: {
      disable: true,
      required: false
    },
    EffectiveDate: {
      disable: false,
      required: true
    },
    programEmail: {
      disable: true,
      required: false
    }
  }




  @wire(getEnrollmentDetails, { accId: '$recordId' }) newgetEnrollmentDetails({
    error, data
  }) {
    if (data) {
      console.log('data:' + JSON.stringify(data));
      this.showEntrollmentForm = true;
      this.showPannelErrorMessage = false;      
      this.enrollmentDetail.Name = data.contactDetail.hasOwnProperty('enrollmentName') == true ? data.contactDetail.enrollmentName : '';
      this.enrollmentDetail.ConId = data.contactDetail.hasOwnProperty('entrollmentContactId') == true ? data.contactDetail.entrollmentContactId : '';
      this.enrollmentDetail.retailerName = data.accountDetail.hasOwnProperty('Name') == true ? data.accountDetail.Name : '';
      this.enrollmentDetail.retailerId = data.accountDetail.hasOwnProperty('Id') == true ? data.accountDetail.Id : '';
      /* if (data.workflowItem != undefined) {
         this.workflowItemId = data.workflowItem.Id;
       }*/
      this.enrollmentDetail.retailerCode = data.accountDetail.hasOwnProperty('Retailer__c') == true ? data.accountDetail.Retailer__c : '';
      if (data.hasOwnProperty('personRoleDetail') == true) {
        this.enrollmentDetail.role = data.personRoleDetail.hasOwnProperty('RE_Employee_Position__c') == true ? data.personRoleDetail.RE_Employee_Position__c : '';
        this.enrollmentDetail.Email = data.personRoleDetail.hasOwnProperty('DPM_Work_Email__c') == true ? data.personRoleDetail.DPM_Work_Email__c : '';
        this.enrollmentDetail.Phone = data.personRoleDetail.hasOwnProperty('DPM_Work_Phone__c') == true ? data.personRoleDetail.DPM_Work_Phone__c : '';
        this.enrollmentDetail.PersonRole = data.personRoleDetail.Id;
      }
      else {
        this.enrollmentDetail.role = '';
        this.enrollmentDetail.Email = '';
        this.enrollmentDetail.Phone = '';
      }

      //console.log(JSON.stringify(data.relatedAccounts));
      this.isLoading = false;
      this.showException = false;
      /* this.pcObj.workflowitem__c = this.workflowItemId;
       this.getPCChangesAction(); */
       /*this.filesList = Object.keys(data.PCComplianceImages).map(item=>({
              "label":data.PCComplianceImages[item],
             "value": item   
            }))
        console.log('fileList:'+JSON.stringify(this.filesList));*/
      /*this.pc_IMAGE_DeviceNameId = data.PCComplianceImages['DeviceName'];
      this.pc_IMAGE_DriveSizeId = data.PCComplianceImages['DriveSize'];
      this.pc_IMAGE_OSTypeId = data.PCComplianceImages['OSType'];
      this.pc_IMAGE_OSVersionId = data.PCComplianceImages['OSVersion'];
      this.pc_IMAGE_PCRAMId = data.PCComplianceImages['RAM'];
      this.pc_IMAGE_ProcessorId = data.PCComplianceImages['Processor'];
      this.pc_IMAGE_NewDeviceNameId = data.PCComplianceImages['NewDeviceName'];*/
      console.log('pc_IMAGE_DeviceName:' + this.pc_IMAGE_DeviceName);
      console.log('pc_IMAGE_DeviceNameId:' + this.pc_IMAGE_DeviceNameId);
        /*for(let x of this.filesList){
          if(x.label.includes('DeviceName')){
            this.pc_IMAGE_DeviceId=x.value;
           // this.pc_IMAGE_DeviceName='https://volvocarsamericas--dpmrcp.sandbox.file.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId='+x.label.split(';')[1]+'&operationContext=CHATTER&contentId='+x.value; 
          }
          if(x.label.includes('RAM')){
            this.pc_IMAGE_RAMId=x.value;
           // this.pc_IMAGE_DeviceName='https://volvocarsamericas--dpmrcp.sandbox.file.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId='+x.label.split(';')[1]+'&operationContext=CHATTER&contentId='+x.value; 
          }
          if(x.label.includes('DriveSize')){
            this.pc_IMAGE_DeviceId=x.value;
           // this.pc_IMAGE_DeviceName='https://volvocarsamericas--dpmrcp.sandbox.file.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId='+x.label.split(';')[1]+'&operationContext=CHATTER&contentId='+x.value; 
          }
          if(x.label.includes('OSVersion')){
            this.pc_IMAGE_DeviceId=x.value;
           // this.pc_IMAGE_DeviceName='https://volvocarsamericas--dpmrcp.sandbox.file.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId='+x.label.split(';')[1]+'&operationContext=CHATTER&contentId='+x.value; 
          }
          if(x.label.includes('OS')){
            this.pc_IMAGE_DeviceId=x.value;
           // this.pc_IMAGE_DeviceName='https://volvocarsamericas--dpmrcp.sandbox.file.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId='+x.label.split(';')[1]+'&operationContext=CHATTER&contentId='+x.value; 
          }
        }*/
       
        
    }
    if (error) {
      console.log(error);
      this.isLoading = false;
      this.showException = true;
    }
  }

  @track openFormModalOpenBln = false;
  @track showPCChanges = false;


  @track pcObjList = [];
  @track ProcessorBln = false;
  @track RamBln = false;
  @track OSTypeBln = false;
  @track OSVersionBln = false;
  @track DriveSizeBln = false;
  @track NewComputerBln = false;
  @track RemoveComputerBln = false;
  @track changesMadeToPCEmpty = false;


  connectedCallback() {

  }


  isEntrollmentPersonValid() {
    let isValid = true;
    try {

      let errorItem = [];
      if (!this.enrollmentDetail.Name) {
        errorItem.push('Name');
      }
      if (!this.enrollmentDetail.Phone) {
        errorItem.push('work phone number');
      }
      if (!this.enrollmentDetail.Email) {
        errorItem.push('work email');
      }
      if (!this.enrollmentDetail.role) {
        errorItem.push('job role');
      }
      if (errorItem.length > 0) {
        this.pannelErrorMessage = errorItem.join(', ');
      }
      if (!this.enrollmentDetail.Name || !this.enrollmentDetail.Phone || !this.enrollmentDetail.Email || !this.enrollmentDetail.role) {
        this.showPannelErrorMessage = true;
        isValid = false;
        const topDiv = this.template.querySelector('[data-id="pc_errorPanel"]');
        topDiv.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
      console.log('showPannelErrorMessage:' + this.showPannelErrorMessage);
      console.log('pannelErrorMessage:' + this.pannelErrorMessage);
    } catch (err) {
      isValid = false;
      console.log(err.stack);
    }
    return isValid
  }

  /*getPCChangesAction() {
   this.isLoading = true;
   getPCChanges({ workflowItemId: this.workflowItemId }).then(response => {
     console.log('pc changes:' + JSON.stringify(response));
     this.pcObjList = response;
     this.isLoading = false;
     if (this.pcObjList.length == 0) {
       this.showPCChanes = false;
     } else {
       this.showPCChanes = true;
     }
   }).catch(error => {
     this.isLoading = false;
     console.log(error);
   });
 } */

  readName(event) {
    let pcname = event.target.value;
    try {
      this.pcObj.RE_PC_Name__c = pcname.trim();
    } catch (err) {
      console.log(err.stack);
    }
    this.handleInputValidation();
  }
  readDateOfUpdate(event) {
    console.log('date val--> ', event.target.value);
    this.pcObj.RE_date_of_update_occurred__c = event.target.value;
    this.handleInputValidation();
  }
  readProcessor(event) {
    this.ProcessorBln = event.target.checked;
    if (!this.ProcessorBln) {
      this.pcObj.RE_Processor_Txt__c = null;
    }
    this.handleInputValidation();  //this is required to clear validation messages after input 
  }
  readProcessorTxt(event) {
    this.pcObj.RE_Processor_Txt__c = event.target.value;
    /*if (!this.show_radio_option1) {
    if (this.pcObj.RE_Processor_Txt__c != '') {
      this.ProcessorBln = true;
    } else {
      this.ProcessorBln = false;
    }
    }*/
    if (this.show_radio_option2) {
        this.ProcessorBln = true;
      }
    this.handleInputValidation();
  }

  readRAM(event) {
    this.RamBln = event.target.checked;
    if (!this.RamBln) {
      this.pcObj.RE_RAM_Txt__c = null;
    }
    this.handleInputValidation();
  }
  readRAMTxt(event) {
    let RAMTxt=event.target.value;
    try{      
      RAMTxt=RAMTxt.trim();
    this.pcObj.RE_RAM_Txt__c = RAMTxt;
 
    /*if (!this.show_radio_option1) {
    if (this.pcObj.RE_RAM_Txt__c != '') {
      this.RamBln = true;
    } else {
      this.RamBln = false;
    }
    }*/
     if (this.show_radio_option2) {
        this.RamBln = true;
      }
    this.handleInputValidation();
    }catch(err){
      console.log(err.stack);
    }
  }

  readOSType(event) {
    this.OSTypeBln = event.target.checked;
    if (!this.OSTypeBln) {
      this.pcObj.RE_OS_Type_Txt__c = '';
    }
    this.handleInputValidation();
  }

  readOSTypeTxt(event) {
    this.pcObj.RE_OS_Type_Txt__c = event.target.value;
   /* if (!this.show_radio_option1) {
    if (this.pcObj.RE_OS_Type_Txt__c != '') {
      this.OSTypeBln = true;
    } else {
      this.OSTypeBln = false;
    }
    }*/
        
    if (this.show_radio_option2) {
        this.OSTypeBln=true;
    }

    console.log('OSTypeBln:'+this.OSTypeBln);
    this.handleInputValidation();
  }

  readOSVersion(event) {
    this.OSVersionBln = event.target.checked;
    if (!this.OSVersionBln) {
      this.pcObj.RE_OS_Version_Txt__c = null;
    }
    this.handleInputValidation();
  }

  readOSVersionTxt(event) {
    let OSVersionTxt = event.target.value;
    console.log('OSVersionTxt:'+OSVersionTxt);
    try {  
      OSVersionTxt=OSVersionTxt.trim();      
      this.pcObj.RE_OS_Version_Txt__c = OSVersionTxt;
       
     /* if (!this.show_radio_option1) {
    if (this.pcObj.RE_OS_Version_Txt__c != '') {
      this.OSVersionBln = true;
    } else {
      this.OSVersionBln = false;
    }
      }*/
      if (this.show_radio_option2) {
        this.OSVersionBln = true;
      }
    this.handleInputValidation();
    } catch (err) {
      console.log(err.stack);
    }
  }

  readDriveSize(event) {
    this.DriveSizeBln = event.target.checked;
    if (!this.DriveSizeBln) {
      this.pcObj.RE_Drive_Size_Txt__c = null;
    }
    this.handleInputValidation();
  }

  readDriveSizeTxt(event) {
    let driveSizeText = event.target.value;
    try {
      if (driveSizeText.includes('.')) {
        driveSizeText = driveSizeText.split('.')[0];
      }
      driveSizeText = driveSizeText.trim();
      console.log('driveSizeText:' + driveSizeText);
      if (this.show_radio_option1) {
        this.template.querySelector('lightning-input[data-name="DriveSizeTxt1"]').value = driveSizeText;
      } else if (this.show_radio_option2) {
        this.template.querySelector('lightning-input[data-name="DriveSizeTxt2"]').value = driveSizeText;
      }
      this.pcObj.RE_Drive_Size_Txt__c = driveSizeText;
      /*if (!this.show_radio_option1) {
    if (this.pcObj.RE_Drive_Size_Txt__c != '') {
      this.DriveSizeBln = true;
    } else {
      this.DriveSizeBln = false;
    }
      }*/
      if (this.show_radio_option2) {
        this.DriveSizeBln = true;
      }
    this.handleInputValidation();
    } catch (err) {
      console.log(err.stack);
    }
  }

  /*
  readNewComputer(event) {
    this.NewComputerBln = event.target.checked;
    if(!this.NewComputerBln){
      this.pcObj.RE_New_Computer_Txt__c=null;
    }
    this.handleInputValidation();
  }
  readNewComputerTxt(event) {
    this.pcObj.RE_New_Computer_Txt__c = event.target.value;
    if (this.pcObj.RE_New_Computer_Txt__c != '') {
      this.NewComputerBln = true;
    } else {
      this.NewComputerBln = false;
    }
    this.handleInputValidation();
  }

  readRemoveComputer(event) {
    this.RemoveComputerBln = event.target.checked;
    if(!this.RemoveComputerBln){
      this.pcObj.RE_Remove_Computer_Txt__c=null;
    }
    this.handleInputValidation();
  }
  readRemoveComputerTxt(event) {
    this.pcObj.RE_Remove_Computer_Txt__c = event.target.value;
    if (this.pcObj.RE_Remove_Computer_Txt__c != '') {
      this.RemoveComputerBln = true;
    } else {
      this.RemoveComputerBln = false;
    }
    this.handleInputValidation();
  }*/

  fillPCChangesMultiPicklist() {
    // console.log('this.pcObj.RE_Changes_Made_To_PC__c:' + this.pcObj.RE_Changes_Made_To_PC__c);
    let emptyArray = ['', undefined, null, ' '];
    if (emptyArray.includes(this.pcObj.RE_Changes_Made_To_PC__c)) {
      this.pcObj.RE_Changes_Made_To_PC__c = '';
    } else {
      this.pcObj.RE_Changes_Made_To_PC__c = ';';
    }
    if (this.ProcessorBln &&
      !this.pcObj.RE_Changes_Made_To_PC__c.includes('Processor')) {
      this.pcObj.RE_Changes_Made_To_PC__c += 'Processor;';
    }
    if (this.RamBln &&
      !this.pcObj.RE_Changes_Made_To_PC__c.includes('RAM')) {
      this.pcObj.RE_Changes_Made_To_PC__c += 'RAM;';
    }
    if (this.OSTypeBln &&
      !this.pcObj.RE_Changes_Made_To_PC__c.includes('OS Type')) {
      this.pcObj.RE_Changes_Made_To_PC__c += 'OS Type;';
    }
    if (this.OSVersionBln &&
      !this.pcObj.RE_Changes_Made_To_PC__c.includes('OS Version')) {
      this.pcObj.RE_Changes_Made_To_PC__c += 'OS Version;';
    }
    if (this.DriveSizeBln &&
      !this.pcObj.RE_Changes_Made_To_PC__c.includes('Drive Size')) {
      this.pcObj.RE_Changes_Made_To_PC__c += 'Drive Size;';
    }
    /* if (this.NewComputerBln &&
       !this.pcObj.RE_Changes_Made_To_PC__c.includes('New Computer')) {
       this.pcObj.RE_Changes_Made_To_PC__c += 'New Computer;';
     }
     if (this.RemoveComputerBln &&
       !this.pcObj.RE_Changes_Made_To_PC__c.includes('Remove Computer')) {
       this.pcObj.RE_Changes_Made_To_PC__c += 'Remove Computer;';
     }*/
    console.log('this.pcObj.RE_Changes_Made_To_PC__c:' + this.pcObj.RE_Changes_Made_To_PC__c);
    return this.pcObj.RE_Changes_Made_To_PC__c;
  }

  @track OSVersionTxtError=false;
  @track RAMTxtError=false;
  @track dateOfUpdateError=false;

  handleInputValidation() {
    let invalidData = false;
    let emptyArray = ['', undefined, null, ' ', ';'];
    let textarea_length = 255;
    try {
      let pcName;
      let dateOfUpdate;
      let processorTxt;
      let RAMTxt;
      let OSTypeTxt;
      let OSVersionTxt;
      let DriveSizeTxt;

      pcName = this.template.querySelector('lightning-input[data-name="pcName"]');

      if (this.show_radio_option1) {
        RAMTxt = this.template.querySelector('input[data-name="RAMTxt1"]');
        OSTypeTxt = this.template.querySelector('lightning-select[data-name="OSTypeTxt1"]');
        OSVersionTxt = this.template.querySelector('input[data-name="OSVersionTxt1"]');
        DriveSizeTxt = this.template.querySelector('lightning-input[data-name="DriveSizeTxt1"]');
        dateOfUpdate = this.template.querySelector('lightning-input[data-name="dateOfUpdate"]');
      } else if (this.show_radio_option2) {
        processorTxt = this.template.querySelector('lightning-input[data-name="processorTxt2"]');
        RAMTxt = this.template.querySelector('input[data-name="RAMTxt2"]');
        OSTypeTxt = this.template.querySelector('lightning-select[data-name="OSTypeTxt2"]');
        OSVersionTxt = this.template.querySelector('input[data-name="OSVersionTxt2"]');
        DriveSizeTxt = this.template.querySelector('lightning-input[data-name="DriveSizeTxt2"]');
        dateOfUpdate = this.template.querySelector('lightning-input[data-name="dateOfUpdate"]');
      } else {
        dateOfUpdate = this.template.querySelector('lightning-input[data-name="dateOfUpdate"]');
      }

      if (!emptyArray.includes(pcName)) {
        if (emptyArray.includes(this.pcObj.RE_PC_Name__c)) {
          invalidData = true;
          pcName.setCustomValidity('Please provide the name value');
          
        } else if (this.pcObj.RE_PC_Name__c.length > textarea_length) {
          invalidData = true;
          pcName.setCustomValidity('Maximum text length allowed is not more than ' + textarea_length + ' characters');
        }
        else {
          pcName.setCustomValidity('');
        }
        pcName.reportValidity();
      }

       if (!emptyArray.includes(dateOfUpdate)) {
        if (emptyArray.includes(this.pcObj.RE_date_of_update_occurred__c)) {
          invalidData = true;
          dateOfUpdate.setCustomValidity('Please provide the date(mm/dd/yyyy)');
          this.dateOfUpdateError=true;
        } else {
          dateOfUpdate.setCustomValidity('');
          this.dateOfUpdateError=false;        
        }
        dateOfUpdate.reportValidity();
      }

      if (!emptyArray.includes(processorTxt)) {
        if (this.ProcessorBln &&
          emptyArray.includes(this.pcObj.RE_Processor_Txt__c)) {
          invalidData = true;
          processorTxt.setCustomValidity('Please provide the processor value');
        } else if (this.ProcessorBln &&
          this.pcObj.RE_Processor_Txt__c.length > textarea_length) {
          invalidData = true;
          processorTxt.setCustomValidity('Maximum text length allowed is not more than ' + textarea_length + ' characters');
        }
        else {
          processorTxt.setCustomValidity('');
        }
        processorTxt.reportValidity();
      }

      if (!emptyArray.includes(RAMTxt)) {
        if (this.RamBln &&
          emptyArray.includes(this.pcObj.RE_RAM_Txt__c)) {
          invalidData = true;
          RAMTxt.setCustomValidity('Please provide the RAM value in decimal');
          this.RAMTxtError=true;
        } else if (this.RamBln &&
          this.pcObj.RE_RAM_Txt__c.length > textarea_length) {
          invalidData = true;
          RAMTxt.setCustomValidity('Maximum text length allowed is not more than ' + textarea_length + ' characters');
          this.RAMTxtError=true;
        }
        else {
          RAMTxt.setCustomValidity('');
          this.RAMTxtError=false;
        }
        RAMTxt.checkValidity();
      }

      if (!emptyArray.includes(OSTypeTxt)) { //element not null 
        if (this.OSTypeBln &&
          emptyArray.includes(this.pcObj.RE_OS_Type_Txt__c)) {
          invalidData = true;
          OSTypeTxt.setCustomValidity('Please provide text that contains Windows');
         // OSTypeTxt.value='Please enter text that contains Windows';
        } else if (this.OSTypeBln &&
          this.pcObj.RE_OS_Type_Txt__c.length > textarea_length) {
          invalidData = true;
         // OSTypeTxt.value='Please enter text that contains Windows';
          OSTypeTxt.setCustomValidity('Maximum text length allowed is not more than ' + textarea_length + ' characters');
        }
        else {
          OSTypeTxt.setCustomValidity('');
        }
        OSTypeTxt.reportValidity();
      }

      if (!emptyArray.includes(OSVersionTxt)) {
        if (this.OSVersionBln &&
          emptyArray.includes(this.pcObj.RE_OS_Version_Txt__c)) {
          invalidData = true;
          OSVersionTxt.setCustomValidity('Please provide the OS Version value in decimal');
          this.OSVersionTxtError=true;
        } else if (this.OSVersionBln &&
          this.pcObj.RE_OS_Version_Txt__c.length > textarea_length) {
          invalidData = true;
          OSVersionTxt.setCustomValidity('Maximum text length allowed is not more than ' + textarea_length + ' characters');
          this.OSVersionTxtError=true;
        }
        else {
          OSVersionTxt.setCustomValidity('');
          this.OSVersionTxtError=false;
        }
        OSVersionTxt.checkValidity();
      }

      if (!emptyArray.includes(DriveSizeTxt)) {
        if (this.DriveSizeBln &&
          (emptyArray.includes(this.pcObj.RE_Drive_Size_Txt__c) || this.pcObj.RE_Drive_Size_Txt__c.includes('.'))) {
          invalidData = true;
          DriveSizeTxt.setCustomValidity('Please provide correct Drive Size value in number');
        } else if (this.DriveSizeBln &&
          this.pcObj.RE_Drive_Size_Txt__c.length > textarea_length) {
          invalidData = true;
          DriveSizeTxt.setCustomValidity('Maximum text length allowed is not more than ' + textarea_length + ' characters');
        }
        else {
          DriveSizeTxt.setCustomValidity('');
        }
        DriveSizeTxt.reportValidity();
      }
      /*
        let NewComputerTxt = this.template.querySelector('lightning-input[data-name="NewComputerTxt"]');
        if (this.NewComputerBln &&
          emptyArray.includes(this.pcObj.RE_New_Computer_Txt__c)) {
          invalidData = true;
          NewComputerTxt.setCustomValidity('Please provide the New Computer value');
        } else if (this.NewComputerBln &&
          this.pcObj.RE_New_Computer_Txt__c.length>textarea_length) {
          invalidData = true;
          NewComputerTxt.setCustomValidity('Maximum text length allowed is not more than 32768 characters');
        }
         else {
          NewComputerTxt.setCustomValidity('');
        }
        NewComputerTxt.reportValidity();
  
        let RemoveComputerTxt = this.template.querySelector('lightning-input[data-name="RemoveComputerTxt"]');
        if (this.RemoveComputerBln &&
          emptyArray.includes(this.pcObj.RE_Remove_Computer_Txt__c)) {
          invalidData = true;
          RemoveComputerTxt.setCustomValidity('Please provide the Remove Computer value');
        } else if (this.RemoveComputerBln &&
          this.pcObj.RE_Remove_Computer_Txt__c.length>textarea_length) {
          invalidData = true;
          RemoveComputerTxt.setCustomValidity('Maximum text length allowed is not more than 32768 characters');
        }
         else {
          RemoveComputerTxt.setCustomValidity('');
        }
        RemoveComputerTxt.reportValidity();
      */
      let changesMadeToPC = this.fillPCChangesMultiPicklist();
      console.log('changesMadeToPC:' + changesMadeToPC);
      //if no checkbox data available
      if (emptyArray.includes(changesMadeToPC) && !this.show_radio_option3) {
        invalidData = true;
        this.changesMadeToPCEmpty = true;
      } else {
        this.changesMadeToPCEmpty = false;
      }
      if (emptyArray.includes(this.pcObj.RE_PC_Change_Type__c)) {
        this.pcChangeTypeEmpty = true;
        invalidData = true;
      } else {
        this.pcChangeTypeEmpty = false;
      }
    } catch (err) {
      invalidData = true;
      console.log(err.stack);
    }
    console.log('invalidData? ' + invalidData);
    console.log('changesMadeToPCEmpty:' + this.changesMadeToPCEmpty);
    return invalidData;
  }

  @track pcChangeTypeEmpty = false;


  saveOpenFormModal() {
    this.isLoading = true;
    //validate inputs
    if (!this.handleInputValidation()) {
      this.openFormModalOpenBln = false;
      this.isLoading = false;
      console.log('pcObj:' + JSON.stringify(this.pcObj));
      console.log('accountid:' + this.enrollmentDetail.retailerId);
      console.log('personroleid' + this.enrollmentDetail.PersonRole);
      let emptyArray = ['', undefined, null, ' '];
      if (!emptyArray.includes(this.itemIndex)) {
        this.pcObjList[this.itemIndex] = this.pcObj;
      } else {
        this.pcObjList.push(this.pcObj);
      }
      if (this.pcObjList.length == 0) {
        this.showPCChanges = false;
      } else {
        this.showPCChanges = true;
      }
      this.resetCheckBoxes();

      /*
      savePCChanges({
        pcObj: this.pcObj,
        accountId: this.enrollmentDetail.retailerId,
        personRoleId: this.enrollmentDetail.PersonRole
      }).then(response => {
        this.workflowItemId=response;
        console.log('workflowItemId:'+this.workflowItemId);
        this.resetCheckBoxes();
        this.isLoading = false;  
        this.getPCChangesAction();
        this.error = undefined;    
      }).catch(error => {
         this.error = error;
                let message = 'Unknown error';
                if (Array.isArray(error.body)) {
                    message = error.body.map(e => e.message).join(', ');
                } else if (typeof error.body.message === 'string') {
                    message = error.body.message;
                }
                const evt = new ShowToastEvent({
                    title: 'ERROR',
                    message: message,
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
        console.log('Error:'+message);
        this.isLoading = false;       
      });*/
    } //end handle input validation
    this.isLoading = false;
  }
  resetCheckBoxes() {
    this.pcObj = { 'sObjectType': 'Workflow_Item_Detail__c', 'RE_Changes_Made_To_PC__c': '', 'workflowitem__c': this.workflowItemId, 'RE_PC_Change_Type__c': '', 'RE_OS_Type_Txt__c':'' };
    this.ProcessorBln = false;
    this.RamBln = false;
    this.OSTypeBln = false;
    this.OSVersionBln = false;
    this.DriveSizeBln = false;
    this.NewComputerBln = false;
    this.RemoveComputerBln = false;
    this.changesMadeToPCEmpty = false;
    this.itemIndex = null;
    this.radio_value = null;
    this.show_radio_option1 = false;
    this.show_radio_option2 = false;
    this.show_radio_option3 = false;
    this.pcChangeTypeEmpty = false;
  }
  deleteOpenFormModal() {
    try {
      console.log('delete > item index:' + this.itemIndex);
      //console.log('pcObjList:'+JSON.stringify(this.pcObjList));
      this.isLoading = true;

      //console.log('pcobj:' + JSON.stringify(this.pcObj));
      let emptyArray = ['', undefined, null, ' '];
      if (!emptyArray.includes(this.itemIndex)) {
        let value = this.pcObjList[this.itemIndex];
        //this.pcObjList.splice(this.itemindex, 1);
        this.pcObjList = this.pcObjList.filter(item => item !== value);
        this.resetCheckBoxes();
      }
      if (this.pcObjList.length == 0) {
        this.showPCChanges = false;
      } else {
        this.showPCChanges = true;
      }
      this.isLoading = false;
      this.closeOpenFormModal();
    } catch (err) {
      console.log(err.stack);
    }
    /*
    deletePCChanges({ pcObjId: this.pcObj.Id }).then(response => {
      this.pcObj = { 'sObjectType': 'Workflow_Item_Detail__c', 'RE_Changes_Made_To_PC__c': '', 'workflowitem__c': this.workflowItemId };
      this.isLoading = false;
      this.error = undefined;
      //  this.showPCChanes=false;
      this.closeOpenFormModal();
      this.getPCChangesAction();
      this.showException = false;
    }).catch(error => {
      console.log(error);
      this.isLoading = false;
      this.closeOpenFormModal();
    });*/
  }

  @track disableSubmitBtn = false;
  submitDataBtnClick() {
    if (this.isEntrollmentPersonValid()) {
      console.log('enrollmentDetail:' + JSON.stringify(this.enrollmentDetail));
      this.isLoading = true;
      this.workflowItemObj.Customer_First_Name__c = this.enrollmentDetail.Name;
      this.workflowItemObj.Phone__c = this.enrollmentDetail.Phone;
      this.workflowItemObj.Email__c = this.enrollmentDetail.Email;
      this.workflowItemObj.Retailer_Code_old__c = this.enrollmentDetail.retailerCode;
      this.workflowItemObj.Retailer__c = this.enrollmentDetail.retailerId;
      this.workflowItemObj.RE_Job_Role__c = this.enrollmentDetail.role;
      this.workflowItemObj.RE_Person_Role__c = this.enrollmentDetail.PersonRole;
      this.workflowItemObj.Status__c = 'Submitted';
      submitWorkflowItem({
        pcObjList: this.pcObjList,
        workflowItem: this.workflowItemObj
      }).then(response => {
        this.isLoading = false;
        this.workflowItemId = response;
        if (this.workflowItemId != null) {
          this.disableSubmitBtn = true;
        } else {
          this.disableSubmitBtn = false;
        }
        this.error = undefined;
        //  this.showPCChanes=false;
        const evt = new ShowToastEvent({
          title: 'Success',
          message: 'Data has been successfully Submitted.',
          variant: 'success',
        });
        this.dispatchEvent(evt);
        this.closeOpenFormModal();
        this.getPCChangesAction();
        this.showException = false;
      }).catch(error => {
        console.log(error);
        this.error = error;
        let message = 'Unknown error';
        if (Array.isArray(error.body)) {
          message = error.body.map(e => e.message).join(', ');
        } else if (typeof error.body.message === 'string') {
          message = error.body.message;
        }
        const evt = new ShowToastEvent({
          title: 'ERROR',
          message: message,
          variant: 'error',
          mode: 'dismissable'
        });
        this.dispatchEvent(evt);
        console.log('Error:' + message);

        this.isLoading = false;
        this.closeOpenFormModal();
      })
    }
  }

  cancelBtnOpenFormModal() {
    this.resetCheckBoxes();
    this.openFormModalOpenBln = false;
  }
  addPcChangesClick() {
    if (this.isEntrollmentPersonValid()) {
      this.resetCheckBoxes();
      this.openFormBtnClick();
    }
  }

  openFormBtnClick() {
    this.openFormModalOpenBln = true;
  }

  closeOpenFormModal() {
    this.openFormModalOpenBln = false;
  }

  @track itemIndex;
  openViewItemClick(event) {
    this.itemIndex = event.currentTarget.dataset.index;
    console.log('itemIndex:' + this.itemIndex);
    try {
      this.pcObj = JSON.parse(JSON.stringify(this.pcObjList[this.itemIndex]));
      console.log('pcObj:' + JSON.stringify(this.pcObj));

      const selectedOption = this.pcObj.RE_PC_Change_Type__c;
      if (selectedOption == 'Report changes/updates to a Tech Computer') {
        this.show_radio_option1 = true;
      } else {
        this.show_radio_option1 = false;
      }
      if (selectedOption == 'Report addition of new compliant Tech Computer') {
        this.show_radio_option2 = true;
      } else {
        this.show_radio_option2 = false;
      }
      if (selectedOption == 'Report decommissioning of a non-compliant Tech Computer') {
        this.show_radio_option3 = true;
      } else {
        this.show_radio_option3 = false;
      }

      if (this.pcObj.RE_Changes_Made_To_PC__c != undefined && this.pcObj.RE_Changes_Made_To_PC__c.includes('Processor')) {
        this.ProcessorBln = true;
      } else {
        this.ProcessorBln = false;
      }
      if (this.pcObj.RE_Changes_Made_To_PC__c != undefined && this.pcObj.RE_Changes_Made_To_PC__c.includes('RAM')) {
        this.RamBln = true;
      } else {
        this.RamBln = false;
      }
      if (this.pcObj.RE_Changes_Made_To_PC__c != undefined && this.pcObj.RE_Changes_Made_To_PC__c.includes('OS Type')) {
        this.OSTypeBln = true;
      } else {
        this.OSTypeBln = false;
      }
      if (this.pcObj.RE_Changes_Made_To_PC__c != undefined && this.pcObj.RE_Changes_Made_To_PC__c.includes('OS Version')) {
        this.OSVersionBln = true;
      } else {
        this.OSVersionBln = false;
      }
      if (this.pcObj.RE_Changes_Made_To_PC__c != undefined && this.pcObj.RE_Changes_Made_To_PC__c.includes('Drive Size')) {
        this.DriveSizeBln = true;
      } else {
        this.DriveSizeBln = false;
      }
      /*  if (this.pcObj.RE_Changes_Made_To_PC__c != undefined && this.pcObj.RE_Changes_Made_To_PC__c.includes('New Computer')) {
        this.NewComputerBln = true;
      } else {
        this.NewComputerBln = false;
      }
      if (this.pcObj.RE_Changes_Made_To_PC__c != undefined && this.pcObj.RE_Changes_Made_To_PC__c.includes('Remove Computer')) {
        this.RemoveComputerBln = true;
      } else {
        this.RemoveComputerBln = false;
        }*/

      this.openFormBtnClick();
    } catch (err) {
      console.log(err.stack);
    }
  }







}