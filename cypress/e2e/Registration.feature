Feature: Registration

Scenario: Admin invites new user with set credentials and verifies the signup process
  Given I am logged in as an "admin"
  And I am on Settings page
  When I invite new user
  And I register new user with set credentials
  Then I should be logged as registered user