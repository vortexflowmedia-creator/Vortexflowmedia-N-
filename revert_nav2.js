const fs=require("fs");
const files=["index.html","services.html","works.html","contact.html","team.html","privacy-policy.html","terms.html"];
for(const fn of files){
  let html=fs.readFileSync(fn,"utf8");
  const before=html;
  // Current: <button class="m-menu-btn"...></button>\n    <div class="nav-actions"><a ...>Start a Project</a>\n    </div>
  // Desired: <div class="nav-actions"><a ...>Start a Project</a>\n    </div>\n    <button class="m-menu-btn"...></button>
  html=html.replace(
    /<button class="m-menu-btn" id="mMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mMenu"><span class="m-menu-btn__box" aria-hidden="true"><span class="m-menu-btn__line"><\/span><span class="m-menu-btn__line"><\/span><span class="m-menu-btn__line"><\/span><\/span><\/button>\s*<div class="nav-actions"><a href="contact\.html" class="nav-cta">Start a Project<\/a>\s*<\/div>/,
    `<div class="nav-actions"><a href="contact.html" class="nav-cta">Start a Project</a>\n    </div>\n    <button class="m-menu-btn" id="mMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mMenu"><span class="m-menu-btn__box" aria-hidden="true"><span class="m-menu-btn__line"></span><span class="m-menu-btn__line"></span><span class="m-menu-btn__line"></span></span></button>`
  );
  // services.html has btn-magnetic class
  html=html.replace(
    /<button class="m-menu-btn" id="mMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mMenu"><span class="m-menu-btn__box" aria-hidden="true"><span class="m-menu-btn__line"><\/span><span class="m-menu-btn__line"><\/span><span class="m-menu-btn__line"><\/span><\/span><\/button>\s*<div class="nav-actions"><a href="contact\.html" class="nav-cta btn-magnetic">Start a Project<\/a>\s*<\/div>/,
    `<div class="nav-actions"><a href="contact.html" class="nav-cta btn-magnetic">Start a Project</a>\n    </div>\n    <button class="m-menu-btn" id="mMenuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mMenu"><span class="m-menu-btn__box" aria-hidden="true"><span class="m-menu-btn__line"></span><span class="m-menu-btn__line"></span><span class="m-menu-btn__line"></span></span></button>`
  );
  if(html!==before){
    fs.writeFileSync(fn, html, "utf8");
    console.log(fn+": reverted CTA left, hamburger rightmost");
  } else {
    console.log(fn+": no change");
  }
}
