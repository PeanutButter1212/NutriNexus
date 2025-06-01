# NutriNuxus



## How to run the App (Dev Build) 

### Prerequisites
- Node.js (v18 or later)
- npm
- Expo CLI

Install Expo globally if you haven’t already:
``` zsh 
npm install -g expo-cli
```

### 1. Clone the Repository 
``` zsh
git clone http://github.com/PeanutButter1212/NutriNexus.git
```
``` zsh
cd NutriNexus
```

### 2. Install Dependencies 
``` zsh
npm install
```

### 3. Start the Development Server
#### (Mac only) open IOS simulator, refer below for instructions on how to run on android 
```zsh
npm run ios
```

## Alternative Way 
### Alternatively, you can download the Android Development Build on your local Android Device or the IOS development build on your computer by scanning the QR codes on our poster 

# How to use NutriNexus

### 1. Sign Up (If you already an account, you can skip this step) 
- Click on the sign up button
- Enter your username, email and password (please make sure your email is a valid one and your password is at least 6 digits)
- You will be redirected to the login page

### 2. Verification of Email (If you already have an account, you can skip this step)  
- A magic link will be sent to your email account
- Click on it to verfify your account 
- Note:
  1. If the link is not pressed, you will not be allowed to log in as your credentials are not yet verified)
  2. The link will bring you to a page that shows "This site can't be reached" error but it is fine, Supabase Auth will verify your identity once you press on the link
 
### 3. Log In 
- Enter your email and password
- It will redirect you to the OTP page
- Check your email where a 6 digit OTP will be sent to your email account

### 4. OTP Verification 
- Enter your OTP code and you will be successfully redirected to your profile

### 5. Key in Details (Not applicable if you are not a first time user, will be redirected back to Profile Page) 
- You will be prompted to update your weight, height, age, calories limit and gender
- Upon clicking on submit, you will be redirected to the profile page 
  
## Guide to using our application 
### Profile Page
On here you will see the personal dashboard, where you can:
  1. Click on "Calories Burnt" where you can view the activity log of meals eaten, alongside their corresponding calories count
  2. View calories consumed every day over the current week on the bar graph
  3. A circular visual indicator to dynamically render how close the user is to exceeding the calories limit for the day (as set in the details page) 
  4. View steps taken every day over the current week on the bar graph (to be implemented) 
  5. Change Character where you can edit your avatar (to be implemented)
  6. View number of points earned in the account (at this point, points have no usage, but we will implement uses for them in future milestones)
  7. View number of steps taken on the current day, as well as calories burnt on the day itself (to be implemented) from steps taken
  8. Click on settings to logout (we will also add an additional feature to update details again here for future milestones)

### Scanner Page
- Grant camera permssion when prompted
- Point the picture at your food (at the moment, our system can detect prata, chicken rice and nasi lemak) and click on "Upload" button
- After approximately 3 minutes (we will be working on hosting our model on faster servers for future milestones), the food and its corresponding calories will be updated in their corresponding fields
- Click on submit to add the meal entry into your account's activity log. You will notice this will update your activity log which can be accessed in the profile page

### Garden Page
- To be implemented

### Map Page
- To be implemented

### Social Page
- To be implemented




