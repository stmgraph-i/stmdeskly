/* ============================================================
   DESKLY · HOW-TO LIBRARY
   The bot's built-in knowledge about using Deskly.
   Wording adapts to the account type.
   ============================================================ */

window.HOW_TO = (function(){

  /* Words change per account type */
  function words(type){
    if (type === 'business') {
      return {
        offering: 'products and services',
        createAccount: 'Create a business Desk',
        editDesk: 'Edit your business Desk',
        servicesLine: 'products and services'
      };
    }
    if (type === 'organisation') {
      return {
        offering: 'services and programmes',
        createAccount: 'Create a Desk for your organisation',
        editDesk: 'Edit your organisation Desk',
        servicesLine: 'services and programmes'
      };
    }
    return {
      offering: 'services',
      createAccount: 'Create a Desk',
      editDesk: 'Edit your Desk',
      servicesLine: 'services'
    };
  }

  /* Topics the bot knows how to answer */
  const TOPICS = [
    {
      id: 'create_account',
      label: 'Create an account',
      keys: ['create account', 'sign up', 'signup', 'make an account', 'open account', 'register', 'how do i start', 'get started'],
      answer: function(type){
        const w = words(type);
        return (
          "To " + w.createAccount.toLowerCase() + ":<br><br>" +
          "1. Open <a href=\"signup.html\">signup.html</a> (or tap <em>Create a Desk</em> on the home page)<br>" +
          "2. Pick what this Desk is for — Myself, My business, or A place<br>" +
          "3. Fill in your email, a strong password, your name, and your link<br>" +
          "4. Add your WhatsApp number<br>" +
          "5. Pick a colour and tap <em>Create my Desk</em><br><br>" +
          "You&rsquo;ll be taken to your dashboard. Your Desk is live immediately."
        );
      }
    },
    {
      id: 'log_in',
      label: 'Log in',
      keys: ['log in', 'login', 'sign in', 'signin', 'how do i log', 'enter my account'],
      answer: function(){
        return (
          "To log in:<br><br>" +
          "1. Open <a href=\"login.html\">login.html</a><br>" +
          "2. Enter your email and password<br>" +
          "3. Tap <em>Log in</em><br><br>" +
          "If you&rsquo;ve logged in on this device before, your account shows as a card at the top — tap it and the email fills in automatically."
        );
      }
    },
    {
      id: 'reset_password',
      label: 'Reset my password',
      keys: ['reset password', 'forgot password', 'forgot my password', 'change password', 'lost password', 'recover password'],
      answer: function(){
        return (
          "If you forgot your password:<br><br>" +
          "1. Go to <a href=\"login.html\">login.html</a><br>" +
          "2. Tap <em>Forgot your password?</em><br>" +
          "3. Enter your email<br>" +
          "4. Check your inbox — you&rsquo;ll get a link to set a new password<br><br>" +
          "The email arrives within a minute. Check spam if you don&rsquo;t see it."
        );
      }
    },
    {
      id: 'edit_desk',
      label: 'Edit my Desk',
      keys: ['edit my desk', 'edit desk', 'change my desk', 'update my desk', 'edit my page', 'change my page'],
      answer: function(type){
        const w = words(type);
        return (
          "To " + w.editDesk.toLowerCase() + ":<br><br>" +
          "1. From the menu (top right), tap <em>Edit my Desk</em><br>" +
          "2. You&rsquo;ll see everything you can change: name, what you do, " + w.servicesLine + ", location, contact details, photos, colours<br>" +
          "3. Change what you want<br>" +
          "4. Tap <em>Save</em> at the bottom<br><br>" +
          "Your public Desk updates the moment you save."
        );
      }
    },
    {
      id: 'add_service',
      label: 'Add a service',
      keys: ['add service', 'add a service', 'new service', 'add product', 'add a product', 'add what i do'],
      answer: function(type){
        const w = words(type);
        return (
          "To add " + w.offering + ":<br><br>" +
          "<strong>From your Desk:</strong> in Settings → " + (type === 'business' ? 'Products and services' : 'Services') + ", write one item per line.<br><br>" +
          "<strong>From this bot:</strong> just say it here. For example:<br>" +
          "• <em>new service: Logo design, ₦15,000</em><br>" +
          "• <em>add service: Haircut</em>"
        );
      }
    },
    {
      id: 'add_photos',
      label: 'Add photos',
      keys: ['add photos', 'add picture', 'add pictures', 'upload photo', 'upload image', 'add image', 'add images'],
      answer: function(){
        return (
          "To add photos:<br><br>" +
          "1. Open <em>Edit my Desk</em> from the menu<br>" +
          "2. Scroll to the <strong>Photos</strong> section<br>" +
          "3. Tap <em>Add your first photo</em> (or <em>+</em> if you already have some)<br>" +
          "4. Choose images from your phone — up to 10<br><br>" +
          "You can reorder them with the ↑ ↓ buttons. They show up on your Desk in the grid you choose."
        );
      }
    },
    {
      id: 'share_desk',
      label: 'Share my Desk',
      keys: ['share my desk', 'share desk', 'share link', 'share my link', 'my link', 'where is my link', 'find my link'],
      answer: function(){
        return (
          "Your Desk has a link. It looks like:<br><br>" +
          "<code>stmdeskly.pages.dev/desk.html?u=yourname</code><br><br>" +
          "To find it:<br>" +
          "1. Open your dashboard<br>" +
          "2. The link is in the box at the top<br>" +
          "3. Tap <em>Copy link</em> to copy it<br><br>" +
          "Put it in your WhatsApp status, your Instagram bio, anywhere. Anyone who opens it sees your Desk."
        );
      }
    },
    {
      id: 'change_colours',
      label: 'Change colours and style',
      keys: ['change colour', 'change color', 'change colours', 'change colors', 'change theme', 'change style', 'change font', 'change pattern'],
      answer: function(){
        return (
          "To change how your Desk looks:<br><br>" +
          "1. Open <em>Edit my Desk</em><br>" +
          "2. Scroll to <strong>Appearance</strong><br>" +
          "3. You can change:<br>" +
          "• Accent colour (buttons, links)<br>" +
          "• Page background<br>" +
          "• Pattern (dots, grid, waves)<br>" +
          "• Font<br>" +
          "• Corners (rounded or sharp)<br>" +
          "• Layout (spacious or compact)<br><br>" +
          "Tap <em>Save</em> when done."
        );
      }
    },
    {
      id: 'contact_details',
      label: 'Change contact details',
      keys: ['contact details', 'change number', 'change whatsapp', 'change email', 'add email', 'add phone', 'change phone', 'contact info'],
      answer: function(){
        return (
          "To update how people reach you:<br><br>" +
          "1. Open <em>Edit my Desk</em><br>" +
          "2. Scroll to <strong>Contact</strong><br>" +
          "3. You can set:<br>" +
          "• WhatsApp number (required)<br>" +
          "• Email address (optional)<br>" +
          "• Phone number (optional)<br>" +
          "• Website or link (optional)<br><br>" +
          "Each one you fill in becomes a button on your public Desk."
        );
      }
    },
    {
      id: 'whatsapp_required',
      label: 'Why WhatsApp is required',
      keys: ['why whatsapp', 'why do you need whatsapp', 'why is whatsapp required', 'whatsapp required'],
      answer: function(){
        return (
          "WhatsApp is required because it&rsquo;s how visitors reach you.<br><br>" +
          "When someone taps <em>Message on WhatsApp</em> on your Desk, it opens a chat with you — pre-filled with a greeting.<br><br>" +
          "All other contact methods (email, phone, website) are optional."
        );
      }
    },
    {
      id: 'who_can_see',
      label: 'Who can see my Desk',
      keys: ['who can see', 'who sees my desk', 'is my desk public', 'private desk', 'hide my desk', 'make my desk private'],
      answer: function(){
        return (
          "Your Desk is public — anyone with the link can see it.<br><br>" +
          "It&rsquo;s like a business card. You choose who to send the link to. But if someone finds the link elsewhere, they can open it.<br><br>" +
          "Don&rsquo;t put anything on your Desk you wouldn&rsquo;t want a stranger to see. Contact details you <em>do</em> want public — that&rsquo;s the point."
        );
      }
    },
    {
      id: 'bot_visitors',
      label: 'What visitors see',
      keys: ['visitor bot', 'visitors see', 'what does the bot do', 'the bot on my desk', 'desk bot'],
      answer: function(type){
        return (
          "Visitors to your Desk see a small chat bubble in the corner.<br><br>" +
          "If they tap it, they can ask questions — about your " + words(type).servicesLine + ", your location, your hours, or how to reach you. The bot answers from what you&rsquo;ve set on your Desk.<br><br>" +
          "If it doesn&rsquo;t know something, it points them to your WhatsApp. So nothing gets missed."
        );
      }
    },
    {
      id: 'help',
      label: 'What can you do',
      keys: ['help', 'what can you do', 'how do you work', 'what do you know', 'commands'],
      answer: function(){
        return "Here&rsquo;s what I can help with:<br><br>" +
          "• <strong>Creating your Desk</strong> — signup, first steps<br>" +
          "• <strong>Logging in</strong> and resetting your password<br>" +
          "• <strong>Editing your Desk</strong> — services, prices, photos, colours<br>" +
          "• <strong>Sharing your link</strong><br>" +
          "• <strong>How your visitors see it</strong><br><br>" +
          "Tap <em>How-to</em> below to pick a topic, or just ask me a question.";
      }
    }
  ];

  /* Find the best matching topic for a question */
  function find(text){
    const q = String(text || '').toLowerCase().trim();
    if (!q) return null;

    /* Exact keyword match first */
    for (const t of TOPICS) {
      for (const k of t.keys) {
        if (q.includes(k)) return t;
      }
    }
    return null;
  }

  /* Is this question asking about "how to use Deskly"? */
  function isHowToQuestion(text){
    const q = String(text || '').toLowerCase();
    return /how (do|does|can|to)|what is|where is|where do|why (is|do)|help|guide|tutorial/.test(q);
  }

  /* Return the list of topics for the "How-to" menu */
  function list(){
    return TOPICS.map(t => ({ id: t.id, label: t.label }));
  }

  function get(id){
    return TOPICS.find(t => t.id === id) || null;
  }

  return { find, list, get, isHowToQuestion };

})();