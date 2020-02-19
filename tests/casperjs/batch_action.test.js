var system = require('system'); 
var port = system.env.RUNPORT; 
var baseURL = port == '80' ? 'http://127.0.0.1/' : 'http://127.0.0.1:' + port + '/';

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var organization_name = makeid(5);

function list_contacts_and_select_three(test) {
    /* find contacts */
    casper.thenOpen(baseURL + "civicrm/contact/search?reset=1", function() {
    //    this.capture('find_contacts.png');
    });
    casper.waitForSelector('#contact_type_chzn_o_1', function success() {
        test.assertExists('#contact_type_chzn_o_1');
        this.click('#contact_type_chzn_o_1');
    }, function fail() {
        test.assertExists('#contact_type_chzn_o_1');
    });
    casper.then(function() {
        // this.capture('click_individual.png');
    });
    casper.waitForSelector('#_qf_Basic_refresh', function success() {
        test.assertExists('#_qf_Basic_refresh');
        this.click('#_qf_Basic_refresh');
    }, function fail() {
        test.assertExists('#_qf_Basic_refresh"]');
    });

    /* all contacts */
    casper.wait(2000);
    casper.then(function() {
        // this.capture('all_contacts.png');
    });
    
    /* check top 3 checkbox */
    casper.waitForSelector('table.selector tr:nth-child(1) td:nth-child(1) input', function success() {
        test.assertExists('table.selector tr:nth-child(1) td:nth-child(1) input');
        this.click('table.selector tr:nth-child(1) td:nth-child(1) input');
    }, function fail() {
        test.assertExists('table.selector tr:nth-child(1) td:nth-child(1) input');
    });
    casper.waitForSelector('table.selector tr:nth-child(2) td:nth-child(1) input', function success() {
        test.assertExists('table.selector tr:nth-child(2) td:nth-child(1) input');
        this.click('table.selector tr:nth-child(2) td:nth-child(1) input');
    }, function fail() {
        test.assertExists('table.selector tr:nth-child(2) td:nth-child(1) input');
    });
    casper.waitForSelector('table.selector tr:nth-child(3) td:nth-child(1) input', function success() {
        test.assertExists('table.selector tr:nth-child(3) td:nth-child(1) input');
        this.click('table.selector tr:nth-child(3) td:nth-child(1) input');
    }, function fail() {
        test.assertExists('table.selector tr:nth-child(3) td:nth-child(1) input');
    });
    casper.then(function() {
        // this.capture('check_3.png');
    });
}

casper.test.begin('Resurrectio test', function(test) {
    casper.start(baseURL, function() {
        // this.capture('login.png');
    });
    casper.waitForSelector("form#user-login-form input[name='name']", function success() {
        test.assertExists("form#user-login-form input[name='name']");
        this.click("form#user-login-form input[name='name']");
    }, function fail() {
        test.assertExists("form#user-login-form input[name='name']");
    });
    casper.waitForSelector("input[name='name']", function success() {
        this.sendKeys("input[name='name']", "admin");
    }, function fail() {
        test.assertExists("input[name='name']");
    });
    casper.waitForSelector("input[name='pass']", function success() {
        this.sendKeys("input[name='pass']", "123456");
    }, function fail() {
        test.assertExists("input[name='pass']");
    });
    casper.waitForSelector("form#user-login-form input[type=submit][value='Log in']", function success() {
        test.assertExists("form#user-login-form input[type=submit][value='Log in']");
        this.click("form#user-login-form input[type=submit][value='Log in']");
    }, function fail() {
        test.assertExists("form#user-login-form input[type=submit][value='Log in']");
    }); /* submit form */
    
    /* 
     * Add to organization
     */

    /* add organization */
    casper.thenOpen(baseURL + "civicrm/contact/add?reset=1&ct=Organization", function() {
        // this.capture('add_organization.png');
    });
    casper.waitForSelector("form[name=Contact] input[name='organization_name']", function success() {
        test.assertExists("form[name=Contact] input[name='organization_name']");
        this.click("form[name=Contact] input[name='organization_name']");
    }, function fail() {
        test.assertExists("form[name=Contact] input[name='organization_name']");
    });
    casper.waitForSelector("input[name='organization_name']", function success() {
        this.sendKeys("input[name='organization_name']", organization_name);
    }, function fail() {
        test.assertExists("input[name='organization_name']");
    });
    casper.then(function() {
        // this.capture('form_write_done.png');
    });
    casper.waitForSelector("form[name=Contact] input[type=submit][value='Save']", function success() {
        test.assertExists("form[name=Contact] input[type=submit][value='Save']");
        this.click("form[name=Contact] input[type=submit][value='Save']");
    }, function fail() {
        test.assertExists("form[name=Contact] input[type=submit][value='Save']");
    }); /* submit form */

    /* organization page */
    casper.wait(2000);
    casper.then(function() {
        // this.capture('organization_info.png');
    })
    casper.then(function() {
        test.assertTitle(organization_name + ' | netiCRM');
    });

    list_contacts_and_select_three(test);

    /* select contact to 組織 */
    casper.waitForSelector("#task", function success() {
        test.assertExists("#task");
        this.evaluate(function () {
            document.querySelector("#task").selectedIndex = 6;
        });
    }, function fail() {
        test.assertExists("#task");
    });
    casper.then(function() {
        // this.capture('select_add_to_organization.png');
    });
    casper.waitForSelector("form[name=Basic] input[type=submit][value='Go']", function success() {
        test.assertExists("form[name=Basic] input[type=submit][value='Go']");
        this.click("form[name=Basic] input[type=submit][value='Go']");
    }, function fail() {
        test.assertExists("form[name=Basic] input[type=submit][value='Go']");
    }); /* submit form */
    casper.wait(2000);
    casper.then(function() {
        // this.capture('add_to_organization.png');
    });

    /* filled up add to organization form */
    casper.waitForSelector("#relationship_type_id", function success() {
        test.assertExists("#relationship_type_id");
        this.evaluate(function () {
            document.querySelector("#relationship_type_id").selectedIndex = 2;
        });
    }, function fail() {
        test.assertExists("#relationship_type_id");
    });
    casper.waitForSelector("#name", function() {
        test.assertExists("#name");
        this.sendKeys("#name", organization_name);
    }, function fail() {
        test.assertExists("#name");
    });
    casper.waitForSelector("form[name=AddToOrganization] input[type=submit][value='Search']", function success() {
        test.assertExists("form[name=AddToOrganization] input[type=submit][value='Search']");
        this.click("form[name=AddToOrganization] input[type=submit][value='Search']");
    }, function fail() {
        test.assertExists("form[name=AddToOrganization] input[type=submit][value='Search']");
    }); /* submit form */
    casper.wait(2000);
    casper.then(function() {
        // this.capture("found_org.png");
    });
    
    /* click add to organization */
    casper.waitForSelector("form[name=AddToOrganization] input[type=submit][value='Add to Organization']", function success() {
        test.assertExists("form[name=AddToOrganization] input[type=submit][value='Add to Organization']");
        this.click("form[name=AddToOrganization] input[type=submit][value='Add to Organization']");
    }, function fail() {
        test.assertExists("form[name=AddToOrganization] input[type=submit][value='Add to Organization']");
    }); /* submit form */
    casper.wait(2000);
    casper.then(function() {
        // this.capture("add_to_org_success.png");
    });

    /* 
     * Record Activity 
     */

    list_contacts_and_select_three(test);

    /* select Record Activity for Contacts */
    casper.waitForSelector("#task", function success() {
        test.assertExists("#task");
        this.evaluate(function () {
            document.querySelector("#task").selectedIndex = 7;
        });
    }, function fail() {
        test.assertExists("#task");
    });
    casper.then(function() {
        // this.capture('select_record_activity.png');
    });
    casper.waitForSelector("form[name=Basic] input[type=submit][value='Go']", function success() {
        test.assertExists("form[name=Basic] input[type=submit][value='Go']");
        this.click("form[name=Basic] input[type=submit][value='Go']");
    }, function fail() {
        test.assertExists("form[name=Basic] input[type=submit][value='Go']");
    }); /* submit form */
    casper.wait(2000);
    casper.then(function() {
        // this.capture('record_activity_form.png');
    });

    /* select Activity Type */
    casper.waitForSelector("#activity_type_id", function success() {
        test.assertExists("#activity_type_id");
        this.evaluate(function () {
            document.querySelector("#activity_type_id").selectedIndex = 1;
        });
    }, function fail() {
        test.assertExists("#activity_type_id");
    });

    /* click save */
    casper.waitForSelector("form[name=Activity] input[type=submit][value='Save']", function success() {
        test.assertExists("form[name=Activity] input[type=submit][value='Save']");
        this.click("form[name=Activity] input[type=submit][value='Save']");
    }, function fail() {
        test.assertExists("form[name=Activity] input[type=submit][value='Save']");
    }); /* submit form */
    casper.wait(2000);
    casper.then(function() {
        // this.capture("record_activity_success.png");
    });

    /*
     * Batch Profile Update for Contact
     */
    
    list_contacts_and_select_three(test);

    /* select Batch Profile Update for Contact */
    casper.waitForSelector("#task", function success() {
        test.assertExists("#task");
        this.evaluate(function () {
            document.querySelector("#task").selectedIndex = 8;
        });
    }, function fail() {
        test.assertExists("#task");
    });
    casper.waitForSelector("form[name=Basic] input[type=submit][value='Go']", function success() {
        test.assertExists("form[name=Basic] input[type=submit][value='Go']");
        this.click("form[name=Basic] input[type=submit][value='Go']");
    }, function fail() {
        test.assertExists("form[name=Basic] input[type=submit][value='Go']");
    }); /* submit form */
    casper.wait(2000);

    /* Select Profile */
    casper.waitForSelector("#uf_group_id", function success() {
        test.assertExists("#uf_group_id");
        this.evaluate(function () {
            document.querySelector("#uf_group_id").selectedIndex = 3;
        });
    }, function fail() {
        test.assertExists("#uf_group_id");
    });
    casper.waitForSelector("form[name=PickProfile] input[type=submit][value='Continue >>']", function success() {
        test.assertExists("form[name=PickProfile] input[type=submit][value='Continue >>']");
        this.click("form[name=PickProfile] input[type=submit][value='Continue >>']");
    }, function fail() {
        test.assertExists("form[name=PickProfile] input[type=submit][value='Continue >>']");
    }); /* submit form */
    casper.wait(2000);
    casper.then(function() {
        // this.capture('batch_update.png');
    });

    /* user1 */
    casper.waitForSelector("tr:nth-child(1) td:nth-child(2) input", function success() {
        test.assertExists("tr:nth-child(1) td:nth-child(2) input");
        this.sendKeys("tr:nth-child(1) td:nth-child(2) input", makeid(3));
    }, function fail() {
        test.assertExists("tr:nth-child(1) td:nth-child(2) input");
    });
    casper.waitForSelector("tr:nth-child(1) td:nth-child(3) input", function success() {
        test.assertExists("tr:nth-child(1) td:nth-child(3) input");
        this.sendKeys("tr:nth-child(1) td:nth-child(3) input", makeid(3));
    }, function fail() {
        test.assertExists("tr:nth-child(1) td:nth-child(3) input");
    });

    /* user2 */
    casper.waitForSelector("tr:nth-child(2) td:nth-child(2) input", function success() {
        test.assertExists("tr:nth-child(2) td:nth-child(2) input");
        this.sendKeys("tr:nth-child(2) td:nth-child(2) input", makeid(3));
    }, function fail() {
        test.assertExists("tr:nth-child(2) td:nth-child(2) input");
    });
    casper.waitForSelector("tr:nth-child(2) td:nth-child(3) input", function success() {
        test.assertExists("tr:nth-child(2) td:nth-child(3) input");
        this.sendKeys("tr:nth-child(2) td:nth-child(3) input", makeid(3));
    }, function fail() {
        test.assertExists("tr:nth-child(2) td:nth-child(3) input");
    });

    /* user3 */
    casper.waitForSelector("tr:nth-child(3) td:nth-child(2) input", function success() {
        test.assertExists("tr:nth-child(3) td:nth-child(2) input");
        this.sendKeys("tr:nth-child(3) td:nth-child(2) input", makeid(3));
    }, function fail() {
        test.assertExists("tr:nth-child(3) td:nth-child(2) input");
    });
    casper.waitForSelector("tr:nth-child(3) td:nth-child(3) input", function success() {
        test.assertExists("tr:nth-child(3) td:nth-child(3) input");
        this.sendKeys("tr:nth-child(3) td:nth-child(3) input", makeid(3));
    }, function fail() {
        test.assertExists("tr:nth-child(3) td:nth-child(3) input");
    });

    casper.then(function() {
        // this.capture('batch_form_done.png');
    });
    casper.waitForSelector("form[name=Batch] input[type=submit][value='Update Contacts']", function success() {
        test.assertExists("form[name=Batch] input[type=submit][value='Update Contacts']");
        this.click("form[name=Batch] input[type=submit][value='Update Contacts']");
    }, function fail() {
        test.assertExists("form[name=Batch] input[type=submit][value='Update Contacts']");
    }); /* submit form */
    casper.wait(2000);
    casper.then(function() {
        // this.capture('batch_update_success.png');
    });

    /*
     * Export Contacts
     */

    list_contacts_and_select_three(test);

    /* select Export Contacts */
    casper.waitForSelector("#task", function success() {
        test.assertExists("#task");
        this.evaluate(function () {
            document.querySelector("#task").selectedIndex = 9;
        });
    }, function fail() {
        test.assertExists("#task");
    });
    casper.waitForSelector("form[name=Basic] input[type=submit][value='Go']", function success() {
        test.assertExists("form[name=Basic] input[type=submit][value='Go']");
        this.click("form[name=Basic] input[type=submit][value='Go']");
    }, function fail() {
        test.assertExists("form[name=Basic] input[type=submit][value='Go']");
    }); /* submit form */
    casper.wait(2000);

    /* click continue >> */
    casper.waitForSelector("form[name=Select] input[type=submit][value='Continue >>']", function success() {
        test.assertExists("form[name=Select] input[type=submit][value='Continue >>']");
        this.click("form[name=Select] input[type=submit][value='Continue >>']");
    }, function fail() {
        test.assertExists("form[name=Select] input[type=submit][value='Continue >>']");
    }); /* submit form */
    casper.wait(2000);
    casper.then(function() {
        // this.capture('continue.png');
    });
    /* select record type */
    casper.waitForSelector("form[name=Map] tr:nth-child(2) select", function success() {
        test.assertExists("form[name=Map] tr:nth-child(2) select");
        this.evaluate(function () {
            document.querySelector("form[name=Map] tr:nth-child(2) select").selectedIndex = 1;
        });
    }, function fail() {
        test.assertExists("form[name=Map] tr:nth-child(2) select");
    });

    /* click Export >> */
    casper.waitForSelector("form[name=Map] input[type=submit][value='Done']", function success() {
        test.assertExists("form[name=Map] input[type=submit][value='Done']");
        this.click("form[name=Map] input[type=submit][value='Done']");
    }, function fail() {
        test.assertExists("form[name=Map] input[type=submit][value='Done']");
    }); /* submit form */
    casper.wait(2000);
    casper.then(function() {
        // this.capture('export_done.png');
    });

    casper.run(function() {
        test.done();
    });
});