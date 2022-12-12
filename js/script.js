document.addEventListener("DOMContentLoaded", () => {

// Grab form element from page
const form = document.querySelector("#postcode")
const message = document.querySelector("#message")
const error = document.querySelector("#error")
const loading = document.querySelector("#loading")
const prompt = document.querySelector("#prompt")
const refresh = document.querySelector("#refresh")

function ShowMPInfo() {
  let result = document.getElementById("mpInfoBox");
  document.getElementById('graphicButton').style="display:block";
  result.style.display = "block";
  document.getElementById('mpInfoBox').scrollIntoView({behavior: "smooth", block: "end", inline: "center"});
  loading.style.display = "none";
  form.style.display = "none";
  prompt.style.display = "none";
  refresh.style.display = "block";
}

function imageSrcToBase64(img) {
  const isBase64 = /^data:image\/(png|jpeg);base64,/.test(img.src);
  if (isBase64) {
    return;
  }
  return fetch(img)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        })
    )
    .then((dataURL) => {
      img.src = dataURL;
    });
}

function generateGraphic() {

  html2canvas(document.querySelector("#mpInfoBox"), {
    useCORS:true,
    proxy: 'https://mpreportcard.github.io/MPReportCard/',
    windowWidth: mpInfoBox.width,
    width: mpInfoBox.width,
    windowHeight: mpInfoBox.height,
    height: mpInfoBox.height,

  }).then(canvas => {
      canvas.id = "graphic";
      document.getElementById('graphicOutput').appendChild(canvas);
      document.getElementById('graphic').style="display:none";
      document.getElementById('graphicButton').style="display:none";
      imgPreview = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      download_image();
  });

}

function download_image() {
  let download = document.getElementById("graphic");
  image = download.toDataURL("image/png").replace("image/png", "image/octet-stream");
  let link = document.createElement('a');
  link.download = "graphic.png";
  link.href = image;
  link.click();
}

let issuesFor = ['Voted to scrap non-dom tax status to train 10,000 more nurses', 'Voted to cut VAT on energy bills', 'Voted to save jobs at P&O Ferries', 'Voted to ban fracking', 'Voted to cut business costs to protect jobs']
let issuesAgainst = ['Voted against scrapping non-dom tax status to train 10,000 more nurses', 'Voted against cutting VAT on energy bills', 'Voted against saving jobs at P&O Ferries', 'Voted to allow fracking', 'Voted against cutting business costs to protect jobs']
let issuesNeutralLab = ['Was absent for the vote on non-dom status', 'Was absent for the vote on VAT on energy bills', 'Was absent from the vote on P&O Ferries jobs', 'Was absent for the vote on fracking', 'Was absent for the vote on cutting business costs']
let issuesNeutralCon = ['Did not vote to scrap non-dom tax status to train 10,000 more nurses', 'Did not vote to cut VAT on energy bills', 'Did not vote to save jobs at P&O Ferries', 'Did not vote to ban fracking', 'Did not vote to cut business costs to protect jobs']
let forImage = ['img/A.png', 'img/A.png', 'img/A.png', 'img/A.png', 'img/A.png'];
let againstImage = ['img/F.png', 'img/F.png', 'img/F.png', 'img/F.png', 'img/F.png'];
//Sewage, Energy VAT, P&O Ferries, Fracking,
let voteCodes = [1417, 1191, 1253, 1372, 1192]

let constituency
let constituencyString
let mpFirstName
let mpLastName
let mpFirstNameRaw
let mpLastNameRaw
let vote
let voteString
let accused
let party
let partyString
let note
let mpPhoto
let mpID

form.addEventListener("submit", e => {
  // Stop page refreshing
  e.preventDefault()
  // Make form data accessible as JS variable

  let formData = new FormData(form)
  let postcode = formData.get("postcode")

  function printMessageToScreen(constituencyString){
  fetch(`https://mpreportcard.github.io/MPReportCard/js/constituencies.json`)
      .then(res => res.json())
      .then(data => {
      if(constituencyString == undefined) {
        error.style.display = "block";
        error.innerHTML = "Sorry, looks like that's an invalid postcode."
      } else if (constituencyString == "Stretford and Urmston" || constituencyString == "West Lancashire") {
        error.style.display = "block";
        error.innerHTML = `Your constituency, ${constituencyString}, does not currently have an MP until an upcoming by-election.`;
      } else {
        loading.style.display = "block";
        error.style.display = "none"
        mpFirstNameRaw = data[constituencyString].Firstname
        mpFirstName = mpFirstNameRaw.toString()
        mpLastNameRaw = data[constituencyString].Lastname
        mpLastName = mpLastNameRaw.toString()
        mpFullName = mpFirstName + " " + mpLastName
        accused = data[constituencyString].Accused
        noteRaw = data[constituencyString].Note
        note = noteRaw.toString();

      fetch(`https://members-api.parliament.uk/api/Members/Search?Name=${mpFirstName}%20${mpLastName}&skip=0&take=20`)
          .then(res => res.json())
          .then(parlData => {
            //console.log(parlData)

            mpPhoto = parlData.items[0].value.thumbnailUrl;
            imageSrcToBase64(mpPhoto);
            party = parlData.items[0].value.latestParty.name;
            mpID = parlData.items[0].value.id;
            console.log(mpID);

            document.getElementById('mpPhoto').src = `${mpPhoto}`

            switch (party) {
                case "Labour (Co-op)":
                  partyString = "Labour and Co-operative";
                  break;
                default:
                  partyString = party;
            }

            mpNameBullet.innerHTML = `${mpFirstName} ${mpLastName}`;
            partyBullet.innerHTML = `${partyString}`;
            constituencyBullet.innerHTML = `${constituencyString}`;

function checkVote(code) {
  fetch(`https://commonsvotes-api.parliament.uk/data/division/${voteCodes[code]}.json`)
      .then(res => res.json())
      .then(voteData => {

        console.log(voteData);

          let ayesArray = voteData.Ayes;
          let ayeTellersArray = voteData.AyeTellers;
          let noesArray = voteData.Noes;
          let noTellersArray = voteData.NoTellers;

          if (partyString == "Conservative") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralCon[code]}: `;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/F.png" width = 48px title="Absent or Abstained"/>`;
          } else if (partyString == "Conservative" && constituencyString == "Southend West") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralCon[code]}: `;
            document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = `An MP may have been absent for several reasons - e.g., away on Parliamentary business, ill, only being elected after this vote, or acting as a teller.`;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          } else if (partyString == "Labour") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralLab[code]}: `;
            document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = `An MP may have been absent for several reasons - e.g., away on Parliamentary business, ill, only being elected after this vote, or acting as a teller.`;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          } else if (partyString == "Labour and Co-operative") {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralLab[code]}: `;
            document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = `An MP may have been absent for several reasons - e.g., away on Parliamentary business, ill, only being elected after this vote, or acting as a teller.`;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          } else {
            document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesNeutralLab[code]}: `;
            document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = `An MP may have been absent for several reasons - e.g., away on Parliamentary business, ill, only being elected after this vote, or acting as a teller.`;
            document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="img/absent.png" width = 48px title="Absent or Abstained"/>`;
          }



          for (let k = 0; k < ayeTellersArray.length; k++) {
            if (ayeTellersArray[k].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesFor[code]}: `;
              document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = ``;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${forImage[code]}" width = 48px title="For"/>`;
              console.log(`voteOutcome${code}: Aye`);
              break;
            }
          }

          for (let l = 0; l < ayesArray.length; l++) {
            if (ayesArray[l].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesFor[code]}: `;
              document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = ``;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${forImage[code]}" width = 48px title="For"/>`;
              console.log(`voteOutcome${code}: Aye`);
              break;
            }
          }

          for (let m = 0; m < noTellersArray.length; m++) {
            if (noTellersArray[m].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesAgainst[code]}: `;
              document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = ``;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${againstImage[code]}" width = 48px title="Against"/>`;
              console.log(`voteOutcome${code}: No`);
              break;
            }
          }

          for (let n = 0; n < noesArray.length; n++) {
            if (noesArray[n].MemberId === mpID) {
              document.getElementById(`issue${code+1}Name`).innerHTML = `${issuesAgainst[code]}: `;
              document.getElementById(`absenceDisclaimer${code+1}`).innerHTML = ``;
              document.getElementById(`voteOutcome${code+1}`).innerHTML = `<img src="${againstImage[code]}" width = 48px title="Against"/>`;
              console.log(`voteOutcome${code}: No`);
              break;
            }
          }
  }
  )
}

checkVote(0);
checkVote(1);
checkVote(2);
checkVote(3);
checkVote(4);

let graphicButton = document.getElementById('graphicButton');
graphicButton.addEventListener("click", generateGraphic);

ShowMPInfo();

twtLink.setAttribute("href", `#`)
fbLink.setAttribute("href", `#`)
waLink.setAttribute("href", `#`)
socials.style = "display: block;"
          })

  }
                      }
            )
  }

function getConstituencyName(postcode) {
  fetch(`https://api.postcodes.io/postcodes/${postcode}`)
    .then(res => res.json())
    .then(data => {
      if(data.status != 200) {
        error.innerHTML = "Sorry, looks like that's an invalid postcode."
        error.style.display = "block";
      } else {
      let constituency = data.result.parliamentary_constituency
      let constituencyString = constituency.toString()
      printMessageToScreen(constituencyString)
      }
    }
    )
}

getConstituencyName(postcode);

})

})
