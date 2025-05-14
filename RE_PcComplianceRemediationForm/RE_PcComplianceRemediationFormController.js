({
	doInit : function(component, event, helper) {
		var profile = event.getParam('profile');
        component.set('v.profile', profile);
        var accId = component.get('v.profile.userSettings.RE_Default_Account_Id__c');
        var accounts = component.get('v.profile.accounts');
		component.set('v.accountId', accId);
        var relaccount =[];
        if(accounts.length > 0) {
            accounts.forEach(function(el){
                relaccount.push(el.Id);
            });
        }
        component.set('v.relatedAccount', relaccount);
        component.set('v.showEnrollmentForm', 'false');
        component.set('v.showEnrollmentFormLwc', 'false');
        window.setTimeout(function(){ 
        	component.set('v.showEnrollmentForm', 'true');
            component.set('v.showEnrollmentFormLwc', 'true');
        }, 500);
	},
    handleRefresh: function(component, event, helper) {
    	 $A.get('e.force:refreshView').fire();
    },
    handleFilePreview: function(component, event, helper) {   
        console.log('handleFilePreview');
        try{
         var documentIds = event.getParam('documentIds');
        console.log('documentIds:'+documentIds);
            //documentIds.push('05TWr000004VPXh');
           
                $A.get('e.lightning:openFiles').fire({
                    recordIds: documentIds
                    });
            } catch (err) {
                console.log(err.stack);
            }         
    },
})