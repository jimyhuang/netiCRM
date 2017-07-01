<?php
class CRM_Contribute_Page_Booster extends CRM_Core_Page {
  function run() {
    $mainCategories = array(
      ts('Connect Exists Donors') => array(
        array(
          'id' => 'first-time-donor',
          'class' => 'mdl-card-theme',
          'title' => ts('First time donation donors'),
          'description' => ts('Send some message to these people who have first time donation to you. This should be first step to maintain your relationship with these donors.'),
          'link' => CRM_Utils_System::url('civicrm/search/FirstTimeDonor'),
        ),
        array(
          'id' => 'half-year-donor',
          'class' => 'mdl-card-theme',
          'title' => ts('Donor who donate in last 6 month'),
          'description' => ts('You can send some result or impact of your project to them. And don\'t forget to exclude them in donation letter.'),
          'link' => CRM_Utils_System::url('civicrm/search/HalfYearDonor', 'force=1'),
        ),
        array(
          'id' => 'contrib-sybnt',
          'class' => 'mdl-card-theme',
          'title' => ts('Last year but not this year donors'),
          'description' => ts('These supporter have donation last year, but not in this year. Remember to connect them when you have some donation campaign.'),
          'link' => CRM_Utils_System::url('civicrm/search/ContribSYBNT', 'force=1'),
        ),
        array(
          'id' => 'failed-no-further-donate',
          'class' => 'mdl-card-theme',
          'title' => ts('After payment failed but not retry in a week'),
          'description' => ts('They may not have enough motivation to complete donation. Instead of contriubtion campaign, send some impact or result of your effort to them.'),
          'link' => CRM_Utils_System::url('civicrm/search/FailedNoFurtherDonate', 'force=1'),
        ),
      ),
      ts('Potential Donors') => array(
        array(
          'id' => 'single-not-recurring',
          'class' => 'mdl-card-theme',
          'title' => ts('Single donation over three times'),
          'description' => ts('These supporter appeal they are interested in your orgnization. You should invite them to join your recurring campaign.'),
          'link' => CRM_Utils_System::url('civicrm/search/SingleNotRecurring', 'force=1'),
        ),
        array(
          'id' => 'recur-search',
          'class' => 'mdl-card-theme',
          'title' => ts('End of recurring contribution'),
          'description' => ts('These supporter will finished their promised recurring contribution. Time to invite them join your next recurring campaign again.'),
          'link' => CRM_Utils_System::url('civicrm/search/RecurSearch', 'mode=booster&force=1'),
        ),
        array(
          'id' => 'attendee-not-donor',
          'class' => 'mdl-card-theme',
          'title' => ts('Attendee but not donor'),
          'description' => ts('They join your event, but not become your donor yet. Time to try to invite them.'),
          'link' => CRM_Utils_System::url('civicrm/search/AttendeeNotDonor', 'force=1'),
        ),
      ),
    );
    $this->assign('main_categories', $mainCategories);
    parent::run();
  }
}
