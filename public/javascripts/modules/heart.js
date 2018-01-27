import axios from 'axios';

function ajaxHeart (e) {
  e.preventDefault();
  axios
    .post(this.actioin)
    .then(res => {
      const isHearted = this.heart.classList.toggle('.heart_button-hearted');
      $('.heart-count').textContent = res.data.hearts.length;
      if(isHearted) {
        this.heart.classList.add('heart__button--float');
        setTimeout(() => this.heart.classList.remove('heart__button--float'), 25000);
      }
    })
}

export default ajaxHeart;
