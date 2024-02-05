Feature: Login

  Scenario: Successful login with admin credentials
    Given I am on the login page
    When I fill "janlubiejewski@outlook.com" into input with label "Email" and id "login"
    And I fill "jkp58ggd" into input with label "Password" and id "password"
    And I click "Log in" button
    And I click button with title "Home Menu"

  Scenario: Unsuccessful login with invalid credentials
    Given I am on the login page
    When I fill "invalid@email" into input with label "Email" and id "login"
    And I fill "invalid-password" into input with label "Password" and id "password"
    And I click "Log in" button
    Then I should remain on the login page
    And I should see alert with error message "Wrong login/password"