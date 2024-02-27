Feature: Quotation Template

  Scenario: Successfull create new Quotation Template
  Given I am logged in as an "admin"
  And I am on Quotation Templates Page
  When I click "Create" button
  And I fill Quotation Template form and save
  And I click "Quotation Templates" on breadscrumb link
  Then I should see added Quotation Template inside table