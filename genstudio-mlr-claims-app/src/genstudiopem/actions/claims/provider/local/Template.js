/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const head = `<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GenStudio External Template</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
        color: #333;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
      }
      .preheader {
        font-size: 10px;
        color: #d70909;
      }
      .logo {
        padding: 20px;
      }
      .head {
        background-color: #000000;
        color: #ffffff;
        text-align: center;
        padding: 20px;
      }
      .head h1 {
        margin: 0;
        font-size: 24px;
      }
      .subhead {
        padding: 20px;
        color: #857b7b;
      }
      .banner {
        width: 100%;
      }
      .banner img {
        width: 100%;
        height: auto;
      }
      .content {
        padding: 20px;
      }
      .content h2 {
        color: #333;
        font-size: 20px;
      }
      .content p {
        line-height: 1.6;
        margin: 10px 0;
      }
      .cta {
        margin: 20px 0;
        text-align: center;
      }
      .cta a {
        display: inline-block;
        background-color: #000000;
        color: #ffffff;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 16px;
      }
      .cta a:hover {
        background-color: #222222;
      }
      .footer {
        font-size: 12px;
        color: #666666;
        text-align: center;
        padding: 10px 20px;
        background-color: #f0f0f0;
      }
    </style>
  </head>`;

// No pod template
module.exports.noPodTemplateContent = `<!DOCTYPE html>
<html>
  ${head}
  <body>
    <div class="email-container">
      <div class="logo">
        <img
          alt="Adobe Lightroom"
          src="https://landing.adobe.com/dam/global/images/lockups/lightroom.logo.74777a.412x56.png"
          width="206"
        />
      </div>
      <div class="preheader">{{pre_header}}</div>
      <div class="banner">
        <img src="{{image}}" alt="Banner" />
      </div>
      <div class="head">
        <h1>{{head}}</h1>
      </div>
      <div class="subhead">{{subhead}}</div>
      <div class="content">
        <p>{{content}}</p>
      </div>
      <div class="cta">
        <a href="{{link}}">{{btn}}</a>
      </div>
      <div class="footer">GenStudio - All rights reserved</div>
    </div>
  </body>
</html>`;

// No pod with duplicate fields (e.g., 2 body)
module.exports.noPodDuplicateFieldsTemplateContent = `<!DOCTYPE html>
<html>
  ${head}
  <body>
    <div class="email-container">
      <div class="logo">
        <img
          alt="Adobe Lightroom"
          src="https://landing.adobe.com/dam/global/images/lockups/lightroom.logo.74777a.412x56.png"
          width="206"
        />
      </div>
      <div class="preheader">{{pre_header}}</div>
      <div class="banner">
        <img src="{{image}}" alt="Banner" />
      </div>
      <div class="head">
        <h1>{{head}}</h1>
        <h1>{{head1}}</h1>
      </div>
      <div class="subhead">{{subhead}}</div>
      <div class="content">
        <p>{{content}}</p>
        <p>{{content1}}</p>
      </div>
      <div class="cta">
        <a href="{{link}}">{{btn}}</a>
      </div>
      <div class="footer">GenStudio - All rights reserved</div>
    </div>
  </body>
</html>`;

// 2 pod template
module.exports.twoPodTemplateContent = `<!DOCTYPE html>
<html>
  ${head}
  <body>
    <div class="email-container">
      <div class="logo">
        <img
          alt="Adobe Lightroom"
          src="https://landing.adobe.com/dam/global/images/lockups/lightroom.logo.74777a.412x56.png"
          width="206"
        />
      </div>
      <div class="preheader">{{ pre_header }}</div>
      <div class="pod">
        <div class="banner">
          <img src="{{pod1_image}}" alt="Banner" />
        </div>
        <div class="head">
          <h1>{{pod1_head}}</h1>
        </div>
        <div class="subhead">{{pod1_subhead}}</div>
        <div class="content">
          <p>{{pod1_content}}</p>
        </div>
        <div class="cta">
          <a href="{{pod1_link}}">{{pod1_btn}}</a>
        </div>
      </div>
      <div class="pod">
        <div class="banner">
          <img src="{{pod2_image}}" alt="Banner" />
        </div>
        <div class="head">
          <h1>{{pod2_head}}</h1>
        </div>
        <div class="subhead">{{pod2_subhead}}</div>
        <div class="content">
          <p>{{pod2_content}}</p>
        </div>
        <div class="cta">
          <a href="{{pod2_link}}">{{pod2_btn}}</a>
        </div>
      </div>
      <div class="footer">GenStudio - All rights reserved</div>
    </div>
  </body>
</html>`;

// 2 pod with duplicate fields (e.g., 2 body per pod)
module.exports.twoPodDuplicateFieldsTemplateContent = `<!DOCTYPE html>
<html>
  ${head}
  <body>
    <div class="email-container">
      <div class="logo">
        <img
          alt="Adobe Lightroom"
          src="https://landing.adobe.com/dam/global/images/lockups/lightroom.logo.74777a.412x56.png"
          width="206"
        />
      </div>
      <div class="preheader">{{ pre_header }}</div>
      <div class="pod">
        <div class="banner">
          <img src="{{pod1_image}}" alt="Banner" />
        </div>
        <div class="head">
          <h1>{{pod1_head}}</h1>
        </div>
        <div class="subhead">{{pod1_subhead}}</div>
        <div class="content">
          <p>{{pod1_content}}</p>
          <p>{{pod1_content1}}</p>
        </div>
        <div class="cta">
          <a href="{{pod1_link}}">{{pod1_btn}}</a>
        </div>
        <div class="cta">
          <a href="{{pod1_link1}}">{{pod1_btn1}}</a>
        </div>
      </div>
      <div class="pod">
        <div class="banner">
          <img src="{{pod2_image}}" alt="Banner" />
        </div>
        <div class="head">
          <h1>{{pod2_head}}</h1>
          <h1>{{pod2_head1}}</h1>
        </div>
        <div class="subhead">{{pod2_subhead}}</div>
        <div class="subhead">{{pod2_subhead1}}</div>
        <div class="content">
          <p>{{pod2_content}}</p>
        </div>
        <div class="cta">
          <a href="{{pod2_link}}">{{pod2_btn}}</a>
        </div>
      </div>
      <div class="footer">GenStudio - All rights reserved</div>
    </div>
  </body>
</html>`;
