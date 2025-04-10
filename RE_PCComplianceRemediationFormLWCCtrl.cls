/**
* --------------------------------------------------------------------------------
* @Name         RE_PCComplianceRemediationFormLWCCtrl.cls
* @Author       
* @ModifiedBy   
* @Version      v1.0
* @CreatedDate  16-10-2024
* @UsedBy       n/a
* --------------------------------------------------------------------------------
* @Description
* Wrapper class used for PC Compliance Remediation Form 
* --------------------------------------------------------------------------------
* @Changes
*        
* --------------------------------------------------------------------------------
**/
public with sharing class RE_PCComplianceRemediationFormLWCCtrl {
    @auraEnabled (cacheable=True)
    public static EnrollmentsWrapper fetchWorkItemDetail(string accId) {
            EnrollmentsWrapper enrollmentDetail = new EnrollmentsWrapper();
            try{
               enrollmentDetail.contactDetail = getContactDetails(UserInfo.getUserId(), accId);
               String conId = enrollmentDetail.contactDetail.entrollmentContactId;
               enrollmentDetail.accountDetail = getAccountDetail(accId);
                enrollmentDetail.personRoleDetail = getPersonRoleDetail(accId, conId, UserInfo.getUserId());
              // enrollmentDetail.PCComplianceImages=getRelatedFilesByFolderId('PC Compliance Images');
              //  enrollmentDetail.workflowItem=getWorkflowItem(accId,enrollmentDetail.personRoleDetail.Id);              
            }
            catch(Exception e){
                VolvoLogger log = new VolvoLogger();
                log.Log('RE_EnrollmentFormContoller.fetchEnrollmentDetail',e,'Exception_Log','','Exception From RE_EnrollmentFormContoller.fetchEnrollmentDetail Method');
            }
            
            return enrollmentDetail;
    }
    public class EnrollmentsWrapper{
        @AuraEnabled public contactDetailWrapper contactDetail {get;set;}
        @AuraEnabled public RE_Person_Role__c personRoleDetail {get;set;}
        @AuraEnabled public Account accountDetail {get;set;}
       // @AuraEnabled public Map<String, String> PCComplianceImages{get;set;}
      //  @AuraEnabled public RE_Workflow_Item__c workflowItem {get;set;}
     }
    public class contactDetailWrapper {
        @AuraEnabled public String enrollmentName {get;set;}
        @AuraEnabled public String entrollmentEmail {get;set;}
        @AuraEnabled public String entrollmentPhone {get;set;}
        @AuraEnabled public String entrollmentContactId {get;set;}
    }
    
    @auraEnabled 
    public static contactDetailWrapper getContactDetails(Id userId, Id AccId){
            contactDetailWrapper contactDetails = new contactDetailWrapper();
            try{
                contact contactData = new contact();
                User userDetail = [Select Id, Email, ContactId, Profile.Name from User Where Id =:userId Limit 1];
                String  userProfile = userDetail.Profile.Name;
                String userEmail = userDetail.Email;
                if(userDetail.ContactId !=null) {
                    Id conId = userDetail.ContactId;
                    contactData = [Select Id, Name, Phone, Email from Contact Where Id=:conId Limit 1];
                }
                else{
                   List<Contact> conList = [Select Id, Name, Phone, Email from Contact Where Email=:userEmail And AccountId=:AccId];
                    if(conList.size() > 0) {
                        contactData = conList[0];
                    }
                }
                if(contactData !=null) {
                    contactDetails.enrollmentName = contactData.Name;
                    contactDetails.entrollmentEmail = contactData.Email;
                    contactDetails.entrollmentPhone = contactData.Phone;
                    contactDetails.entrollmentContactId = contactData.Id;
                }
                
            }
            catch(Exception e){
                VolvoLogger log = new VolvoLogger();
                log.Log('RE_EnrollmentFormContoller.getContactDetails',e,'Exception_Log','','Exception From RE_EnrollmentFormContoller.getContactDetails Method');
            }
            return contactDetails;
    }
    
    @auraEnabled
    public static Account getAccountDetail(String accId) { 
        List<Account> accountDetail = new List<Account>();
         try{
            accountDetail = [Select Id, Name, Retailer__c from Account Where Id =:accId Limit 1 ];
         }
        catch(Exception e){
            VolvoLogger log = new VolvoLogger();
            log.Log('RE_EnrollmentFormContoller.getAccountDetail',e,'Exception_Log','','Exception From RE_EnrollmentFormContoller.getAccountDetail Method');
        }
        return (accountDetail.size() > 0) ? accountDetail[0] : null;
        
    }
    
    @auraEnabled
    public static RE_Person_Role__c getPersonRoleDetail(String accId, String ConId, Id userId) { 
        List<RE_Person_Role__c> personRoles = new List<RE_Person_Role__c>();
        Boolean isAccessEmail = Schema.sObjectType.RE_Person_Role__c.fields.DPM_Work_Email__c.isAccessible();
        System.debug('isAccessEmail' +isAccessEmail);
        Boolean isAccessPhone = Schema.sObjectType.RE_Person_Role__c.fields.DPM_Work_Phone__c.isAccessible();
        try{
            personRoles = [
                SELECT Id, DPM_Work_Email__c, DPM_Work_Phone__c,RE_User__c, RE_Account__c,RE_Employee_Position__c,DPM_Primary__c, RE_Account__r.Retailer__c, 
                RE_Contact__c, RE_Account__r.Name FROM RE_Person_Role__c
                WHERE RE_Account__c = :accId
                AND RE_Contact__c =:ConId
                AND RE_User__c =:userId
                AND RE_Psn_Active__c = TRUE
                AND RE_Position_Active__c = TRUE
                LIMIT 1
            ];
        }
        catch(Exception e){
            VolvoLogger log = new VolvoLogger();
            log.Log('RE_EnrollmentFormContoller.getPersonRoleDetail',e,'Exception_Log','','Exception From RE_EnrollmentFormContoller.getPersonRoleDetail Method');
        }
        return (personRoles.size() > 0) ? personRoles[0] : null;
    }
    
    /*public static RE_Workflow_Item__c getWorkflowItem(Id accountId,Id personRoleId){
        RE_Workflow_Item__c workflowItem;
        try{
            workflowItem=[SELECT Id,(select id,RE_PC_Name__c,RE_Changes_Made_To_PC__c,RE_Processor_Txt__c,RE_RAM_Txt__c,RE_OS_Type_Txt__c,
                RE_OS_Version_Txt__c,RE_Drive_Size_Txt__c 
                                     from Workflow_Item_Details__r 
                                     WHERE Recordtype.developername='PC_Compliance')
                         FROM RE_Workflow_Item__c                         
                         WHERE RE_Person_Role__c=:personRoleId
                         AND Retailer__c=:accountid
                         AND Recordtype.developername='PC_Compliance'];
        }catch(Exception ex){
           system.debug(ex);
        }
        return workflowItem;
    }*/

    
    
   /* @AuraEnabled
    public static List<Workflow_Item_Detail__c> getPCChangesData(String workflowItemId){ 
        List<Workflow_Item_Detail__c> data=new List<Workflow_Item_Detail__c>();
        if(!String.isEmpty(workflowItemId)){
            data=[select id,workflowitem__c,RE_PC_Name__c,RE_Changes_Made_To_PC__c,RE_Processor_Txt__c,RE_RAM_Txt__c,RE_OS_Type_Txt__c,
                RE_OS_Version_Txt__c,RE_Drive_Size_Txt__c,RE_New_Computer_Txt__c,RE_Remove_Computer_Txt__c
                from Workflow_Item_Detail__c where workflowitem__c=:workflowItemId];
        }
        return data;
    }*/

     
    @AuraEnabled
    public static String submitWorkflowItemData(List<Workflow_Item_Detail__c> pcObjList,RE_Workflow_Item__c workflowItem){        
        String workflowItemId;
            try{
                workflowItem.RecordTypeId=Schema.SObjectType.RE_Workflow_Item__c.getRecordTypeInfosByName().get('PC Compliance').getRecordTypeId();
            insert workflowItem; 
            workflowItemId=workflowItem.Id;
            for(Workflow_Item_Detail__c wid:pcObjList){
                wid.workflowitem__c=workflowItemId;
                wid.RecordTypeId=Schema.SObjectType.Workflow_Item_Detail__c.getRecordTypeInfosByName().get('PC Compliance').getRecordTypeId();
            }
            insert pcObjList;
        }catch(Exception ex){
            throw new AuraHandledException(ex+'\n'+ex.getStackTraceString());
        }
        return workflowItemId;
    }
    
    /*@AuraEnabled
    public static String savePCChangesData(Workflow_Item_Detail__c pcObj,String accountId,String personRoleId){        
         RE_Workflow_Item__c workflowItem;
         try{
            workflowItem=getWorkflowItem(accountid,personRoleId);
            if(workflowItem==null){
                workflowItem=createWorkFlowItem(accountId,personRoleId);
            }
        if(String.isEmpty(pcObj.workflowitem__c)){                
            pcObj.workflowitem__c=workflowItem.Id;
        } 
        if(pcObj.RecordTypeId==null){
            pcObj.RecordTypeId=Schema.SObjectType.Workflow_Item_Detail__c.getRecordTypeInfosByName().get('PC Compliance').getRecordTypeId();
        }       
        if(pcObj.Id==null){  
        	insert pcObj;
        }else{
            update pcObj;
        }
        workflowItem.status__c='In progress';
        update workflowItem;
         }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage()+'\n'+ex.getStackTraceString());
         }
        return workflowItem.Id;
    }
    
    @AuraEnabled
    public static void deletePCChangesData(String pcObjId){
      //  System.debug('pcObpcObjIdj:'+pcObjId);
        delete [select id from Workflow_Item_Detail__c where id=:pcObjId];
    }*/

   /* public static Map<String, String> getRelatedFilesByFolderId(String folderName) {
        Map<String, String> mapIdTitle=new  Map<String, String>();
        try{
            Id folderId=[SELECT Id, Name, Description, WorkspaceType, DeveloperName, WorkspaceImageId FROM ContentWorkspace where name=:folderName].Id;
            // Get record file IDs        
            List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :folderId];
            List<ID> fileIDs = new List<ID>();
            for (ContentDocumentLink docLink : files) {
                fileIDs.add(docLink.ContentDocumentId);
            }     
            List<ContentVersion> docs = [SELECT ContentDocumentId, FileExtension, Title 
                FROM ContentVersion WHERE ContentDocumentId IN : fileIDs];           
            for (ContentVersion docLink : docs) {
                mapIdTitle.put(docLink.Title,docLink.ContentDocumentId);
            }
        }catch(Exception ex){
            System.debug(ex);
        }
            return mapIdTitle;
        }*/

}