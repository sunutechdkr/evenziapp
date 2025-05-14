import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface EmailTemplateProps {
  firstName: string;
  lastName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  registrationType: string;
  qrCodeUrl: string;
}

export const EmailTemplate = ({
  firstName,
  lastName,
  eventName,
  eventDate,
  eventLocation,
  registrationType,
  qrCodeUrl,
}: EmailTemplateProps) => {
  const previewText = `Your registration for ${eventName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[600px]">
            <Section className="mt-[32px]">
              <Text className="text-[#1d1c1d] text-[30px] font-bold">
                Your Event Registration
              </Text>
              <Text className="text-[#1d1c1d] text-[18px] font-bold mt-4">
                Hello {firstName} {lastName},
              </Text>
              <Text className="text-[#1d1c1d] text-[16px]">
                Thank you for registering for {eventName}. We're excited to have you join us!
              </Text>
            </Section>
            
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Section>
              <Text className="text-[#1d1c1d] text-[18px] font-bold">
                Event Details
              </Text>
              <Text className="text-[#1d1c1d] text-[16px]">
                <strong>Event:</strong> {eventName}
              </Text>
              <Text className="text-[#1d1c1d] text-[16px]">
                <strong>Date:</strong> {eventDate}
              </Text>
              <Text className="text-[#1d1c1d] text-[16px]">
                <strong>Location:</strong> {eventLocation}
              </Text>
              <Text className="text-[#1d1c1d] text-[16px]">
                <strong>Registration Type:</strong> {registrationType}
              </Text>
            </Section>
            
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Section className="text-center">
              <Text className="text-[#1d1c1d] text-[18px] font-bold">
                Your Registration Badge
              </Text>
              <Text className="text-[#1d1c1d] text-[16px]">
                Please present this QR code at the check-in desk on the day of the event.
              </Text>
              
              <Section className="mt-4 mb-8">
                <Row>
                  <Column align="center">
                    {qrCodeUrl && (
                      <Img
                        src={qrCodeUrl}
                        width="200"
                        height="200"
                        alt="QR Code"
                        className="rounded-md"
                      />
                    )}
                  </Column>
                </Row>
              </Section>
              
              <Text className="text-[#1d1c1d] text-[14px]">
                You can also download and print your badge from the following link:
              </Text>
              <Link href="#" className="text-blue-600 underline">
                Download Badge
              </Link>
            </Section>
            
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Section>
              <Text className="text-[#1d1c1d] text-[14px] text-center">
                © 2024 Inevent. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}; 