import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { TeamMember } from '@/types';

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Dr. Void McEmpty',
    role: 'Chief Nothing Officer',
    bio: 'Pioneer in the field of nothingness with over 20 years of experience in achieving absolutely nothing. PhD in Existential Emptiness from the University of Void.',
    avatar: '/api/placeholder/150/150',
    socialLinks: {
      twitter: 'https://twitter.com/voidmcempty',
      github: 'https://github.com/voidmcempty',
      linkedin: 'https://linkedin.com/in/voidmcempty'
    }
  },
  {
    id: '2',
    name: 'Sarah Nullington',
    role: 'Director of Emptiness',
    bio: 'Former senior developer who realized the true value of doing nothing. Now leads our team in achieving peak nothingness through advanced void methodologies.',
    avatar: '/api/placeholder/150/150',
    socialLinks: {
      twitter: 'https://twitter.com/sarahnull',
      linkedin: 'https://linkedin.com/in/sarahnull'
    }
  },
  {
    id: '3',
    name: 'Marcus Zero',
    role: 'Void Engineer',
    bio: 'Specialist in nothing optimization and empty space maximization. Holds multiple patents in advanced nothingness techniques and zero-point productivity.',
    avatar: '/api/placeholder/150/150',
    socialLinks: {
      github: 'https://github.com/marcuszero',
      linkedin: 'https://linkedin.com/in/marcuszero'
    }
  },
  {
    id: '4',
    name: 'Luna Absence',
    role: 'Nothing Designer',
    bio: 'Award-winning designer who creates beautiful interfaces for displaying nothing. Expert in minimalism taken to its logical extreme.',
    avatar: '/api/placeholder/150/150',
    socialLinks: {
      twitter: 'https://twitter.com/lunaabsence',
      linkedin: 'https://linkedin.com/in/lunaabsence'
    }
  }
];

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
}

const TeamMemberCard = ({ member, index }: TeamMemberCardProps) => {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 group"
      role="article"
      aria-labelledby={`team-member-${member.id}-name`}
    >
      <div className="text-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          className="relative mx-auto w-32 h-32 mb-6"
        >
          <img
            src={member.avatar}
            alt={`${member.name}, ${member.role}`}
            className="w-full h-full rounded-full object-cover border-4 border-purple-200 dark:border-purple-800 group-hover:border-purple-400 dark:group-hover:border-purple-600 transition-colors"
            loading="lazy"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-400/20 to-pink-400/20 group-hover:from-purple-400/40 group-hover:to-pink-400/40 transition-all duration-300" />
        </motion.div>

        <h3
          id={`team-member-${member.id}-name`}
          className="text-xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {member.name}
        </h3>
        
        <p className="text-purple-600 dark:text-purple-400 font-semibold mb-3">
          {member.role}
        </p>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
          {member.bio}
        </p>

        {member.socialLinks && (
          <div className="flex justify-center space-x-4">
            {Object.entries(member.socialLinks).map(([platform, url]) => (
              <motion.a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30"
                aria-label={`${member.name}'s ${platform} profile`}
              >
                {getSocialIcon(platform)}
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const TeamSection = () => {
  return (
    <section 
      className="py-20 px-6 bg-gray-50 dark:bg-gray-900"
      aria-labelledby="team-section-title"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            id="team-section-title"
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Meet the Experts in{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nothing
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our world-class team of nothing specialists brings decades of experience 
            in achieving absolutely nothing with unprecedented precision and style.
          </p>
        </motion.div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          role="list"
          aria-label="Team members"
        >
          {teamMembers.map((member, index) => (
            <div key={member.id} role="listitem">
              <TeamMemberCard member={member} index={index} />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Want to join our team of nothing experts?{' '}
            <a 
              href="/careers" 
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors font-semibold underline"
              aria-label="View career opportunities"
            >
              We're always not hiring!
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
